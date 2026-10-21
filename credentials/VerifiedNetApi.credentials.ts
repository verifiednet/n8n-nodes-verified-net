import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class VerifiedNetApi implements ICredentialType {
	name = 'verifiedNetApi';

	displayName = 'Verified.net API';

	icon: Icon = { light: 'file:../icons/verified.svg', dark: 'file:../icons/verified.dark.svg' };

	documentationUrl = 'https://verified.net/docs#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create one at https://app.verified.net/keys',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.verified.net',
			description: 'Leave as is unless Verified.net support gives you another address',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl || "https://api.verified.net"}}',
			url: '/v1/account',
			method: 'GET',
		},
	};
}
