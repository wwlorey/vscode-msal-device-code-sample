import { DeviceCodeResponse } from '@azure/msal-common';
import { PublicClientApplication } from '@azure/msal-node';
import { commands, env, ExtensionContext, MessageItem, Uri, window } from 'vscode';

export function activate(context: ExtensionContext) {
	const msalConfiguration = {
		auth: {
			// The Azure Account Extension's client id
			clientId: 'aebc6443-996d-45c2-90f0-388ff96faa56'
		}
	};

	const publicClientApp = new PublicClientApplication(msalConfiguration);

	const disposable = commands.registerCommand('extension.loginWithDeviceCode', async () => {
		const authResult = await publicClientApp.acquireTokenByDeviceCode({
			scopes: ['user.read'],
			deviceCodeCallback: async (response: DeviceCodeResponse) => {
				const copyAndOpen: MessageItem = { title: 'Copy & Open' };
				const result: MessageItem | undefined = await window.showInformationMessage(response.message, copyAndOpen);
				if (result === copyAndOpen) {
					void env.clipboard.writeText(response.userCode);
					await env.openExternal(Uri.parse(response.verificationUri));
				} else {
					return Promise.reject('User canceled.');
				}
			}
		});
		window.showInformationMessage(JSON.stringify(authResult));
	});

	context.subscriptions.push(disposable);
}
