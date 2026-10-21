import {
	NodeConnectionTypes,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

const bypassCache: INodeProperties = {
	displayName: 'Bypass Cache',
	name: 'bypassCache',
	type: 'boolean',
	default: false,
	description:
		'Whether to run a fresh, charged check. By default the same value checked again within 7 days is free and returns the earlier answer.',
	routing: { send: { type: 'body', property: 'bypass_cache' } },
};

const defaultCountry: INodeProperties = {
	displayName: 'Default Country',
	name: 'defaultCountry',
	type: 'string',
	default: 'US',
	placeholder: 'US',
	description: 'Two-letter country code assumed for numbers written without a +country code',
	routing: { send: { type: 'body', property: 'default_country', value: '={{$value || undefined}}' } },
};

export class VerifiedNet implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Verified.net',
		name: 'verifiedNet',
		icon: { light: 'file:../../icons/verified.svg', dark: 'file:../../icons/verified.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Verify email addresses, validate phone numbers, look up carriers and IP addresses with Verified.net',
		defaults: {
			name: 'Verified.net',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'verifiedNetApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl || "https://api.verified.net"}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Email', value: 'email' },
					{ name: 'IP Address', value: 'ip' },
					{ name: 'Phone', value: 'phone' },
				],
				default: 'email',
			},

			// ----- Email -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['email'] } },
				options: [
					{
						name: 'Verify',
						value: 'verify',
						action: 'Verify an email address',
						description:
							'Syntax, mail server, mailbox, disposable, role and typo checks with an accept, review or reject recommendation (1 credit)',
						routing: { request: { method: 'POST', url: '/v1/email' } },
					},
					{
						name: 'Reverse Lookup',
						value: 'reverseLookup',
						action: 'Find who is behind an email address',
						description:
							'Registrant contacts for an email address (10 credits, only when something is found)',
						routing: { request: { method: 'POST', url: '/v1/reverse/email' } },
					},
				],
				default: 'verify',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['email'], operation: ['verify'] } },
				description: 'The email address to verify',
				routing: { send: { type: 'body', property: 'address' } },
			},
			{
				displayName: 'Email',
				name: 'reverseEmail',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['email'], operation: ['reverseLookup'] } },
				description: 'The email address to look up',
				routing: { send: { type: 'body', property: 'email' } },
			},
			{
				displayName: 'Options',
				name: 'emailOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['email'] } },
				options: [bypassCache],
			},

			// ----- Phone -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['phone'] } },
				options: [
					{
						name: 'Validate',
						value: 'validate',
						action: 'Validate a phone number',
						description:
							'Format, line type, region, original carrier, VoIP and spam reports (1 credit)',
						routing: { request: { method: 'POST', url: '/v1/phone' } },
					},
					{
						name: 'Get Carrier',
						value: 'getCarrier',
						action: 'Get the current carrier of a phone number',
						description:
							'Live current carrier, porting status and line type for US and Canadian numbers (3 credits)',
						routing: { request: { method: 'POST', url: '/v1/carrier' } },
					},
					{
						name: 'Reverse Lookup',
						value: 'reverseLookup',
						action: 'Find who is behind a phone number',
						description:
							'Caller ID name and registrant contacts for US and Canadian numbers (charged only when something is found)',
						routing: { request: { method: 'POST', url: '/v1/reverse/phone' } },
					},
				],
				default: 'validate',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				placeholder: '+1 202 456 1111',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['phone'], operation: ['validate', 'getCarrier'] } },
				description: 'The phone number, ideally with its +country code',
				routing: { send: { type: 'body', property: 'number' } },
			},
			{
				displayName: 'Phone Number',
				name: 'reversePhone',
				type: 'string',
				placeholder: '+1 202 456 1111',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['phone'], operation: ['reverseLookup'] } },
				description: 'The US or Canadian phone number to look up',
				routing: { send: { type: 'body', property: 'phone' } },
			},
			{
				displayName: 'Tier',
				name: 'tier',
				type: 'options',
				displayOptions: { show: { resource: ['phone'], operation: ['reverseLookup'] } },
				options: [
					{
						name: 'Standard',
						value: 'standard',
						description: 'Caller ID name (10 credits when found)',
					},
					{
						name: 'Premium',
						value: 'premium',
						description: 'Caller ID name and registrant contacts (25 credits when contacts are found)',
					},
				],
				default: 'standard',
				routing: { send: { type: 'body', property: 'tier' } },
			},
			{
				displayName: 'Options',
				name: 'phoneOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['phone'] } },
				options: [bypassCache, defaultCountry],
			},

			// ----- IP -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ip'] } },
				options: [
					{
						name: 'Look Up',
						value: 'lookup',
						action: 'Look up an IP address',
						description: 'Location, network, Tor and datacenter detection and a risk score (1 credit)',
						routing: { request: { method: 'POST', url: '/v1/ip' } },
					},
				],
				default: 'lookup',
			},
			{
				displayName: 'IP Address',
				name: 'ipAddress',
				type: 'string',
				placeholder: '8.8.8.8',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['ip'] } },
				description: 'The IPv4 or IPv6 address to look up',
				routing: { send: { type: 'body', property: 'ip' } },
			},
			{
				displayName: 'Options',
				name: 'ipOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['ip'] } },
				options: [bypassCache],
			},

			// ----- Contact -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{
						name: 'Verify',
						value: 'verify',
						action: 'Verify a contact',
						description:
							'Check whether a name and/or phone number match the records for an email address (1 credit). Returns match levels only.',
						routing: { request: { method: 'POST', url: '/v1/contact' } },
					},
				],
				default: 'verify',
			},
			{
				displayName: 'Email',
				name: 'contactEmail',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['contact'] } },
				description: 'The email address the name and phone should belong to',
				routing: { send: { type: 'body', property: 'email' } },
			},
			{
				displayName: 'Name',
				name: 'contactName',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['contact'] } },
				description: 'Full name to check. Give a name, a phone number or both.',
				routing: { send: { type: 'body', property: 'name', value: '={{$value || undefined}}' } },
			},
			{
				displayName: 'Phone Number',
				name: 'contactPhone',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['contact'] } },
				description: 'Phone number to check. Give a name, a phone number or both.',
				routing: { send: { type: 'body', property: 'phone', value: '={{$value || undefined}}' } },
			},
			{
				displayName: 'Options',
				name: 'contactOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['contact'] } },
				options: [defaultCountry],
			},

			// ----- Account -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get your account balance and usage',
						description: 'Credit balance, usage today and in the last 30 days (free)',
						routing: { request: { method: 'GET', url: '/v1/account' } },
					},
				],
				default: 'get',
			},
		],
	};
}
