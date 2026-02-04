import { SignJWT, importPKCS8 } from 'jose';
import SERVICE_ACCOUNT_JSON from './serviceAccount.json';

const PROJECT_ID = SERVICE_ACCOUNT_JSON.project_id || "YOUR_PROJECT_ID";
const LOCATION = "us-central1";
const ENDPOINT_DISPLAY_NAME = "llama-3-1-8b-instruct-deploy";

async function getAccessToken() {
    const privateKey = await importPKCS8(SERVICE_ACCOUNT_JSON.private_key, 'RS256');

    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
        scope: 'https://www.googleapis.com/auth/cloud-platform'
    })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + 3600)
        .setIssuer(SERVICE_ACCOUNT_JSON.client_email)
        .setSubject(SERVICE_ACCOUNT_JSON.client_email)
        .setAudience(SERVICE_ACCOUNT_JSON.token_uri)
        .sign(privateKey);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function getEndpointResourceName(accessToken, endpointDisplayName) {
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints?filter=display_name="${endpointDisplayName}"`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get endpoint: ${error}`);
    }

    const data = await response.json();
    if (!data.endpoints || data.endpoints.length === 0) {
        throw new Error(`Endpoint '${endpointDisplayName}' not found`);
    }

    return data.endpoints[0].name;
}

export async function sendMessageToVertexAI(apiMessages, settings) {
    const { model, temperature, maxTokens } = settings;
    const endpointDisplayName = model || ENDPOINT_DISPLAY_NAME;

    try {
        const accessToken = await getAccessToken();
        const endpointName = await getEndpointResourceName(accessToken, endpointDisplayName);

        const instances = [{
            "@requestFormat": "chatCompletions",
            "messages": apiMessages,
            "max_tokens": maxTokens || 512,
            "temperature": temperature || 0.2,
            "top_p": 0.9
        }];

        const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/${endpointName}:predict`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: instances
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(async () => ({ error: { message: await response.text() } }));
            throw new Error(error.error?.message || 'Failed to get response from Vertex AI');
        }

        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
            let result = data.predictions[0];
            if (Array.isArray(result) && result.length > 0) {
                result = result[0];
            }

            if (result && typeof result === 'object' && 'message' in result) {
                return result.message.content || '';
            }

            return String(result);
        }

        throw new Error('No predictions returned from Vertex AI');
    } catch (error) {
        throw new Error(`Vertex AI error: ${error.message}`);
    }
}

export async function fetchAvailableModels() {
    try {
        const accessToken = await getAccessToken();
        const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch endpoints');
        }

        const data = await response.json();

        if (data.endpoints && data.endpoints.length > 0) {
            return data.endpoints.map(endpoint => ({
                id: endpoint.displayName,
                object: 'model',
                created: endpoint.createTime ? new Date(endpoint.createTime).getTime() : null,
                owned_by: 'vertex-ai'
            }));
        }

        return [{
            id: ENDPOINT_DISPLAY_NAME,
            object: 'model',
            created: null,
            owned_by: 'vertex-ai'
        }];
    } catch (error) {
        console.error('Error fetching models:', error);
        return [{
            id: ENDPOINT_DISPLAY_NAME,
            object: 'model',
            created: null,
            owned_by: 'vertex-ai'
        }];
    }
}
