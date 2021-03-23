import fs from 'fs/promises';
import https from 'https';
import path from 'path';
import {fileURLToPath} from 'url';
import contractAddresses from './contractAddresses.js';

const rootPath = path.join(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const contractsPath = path.join(rootPath, 'src', 'crucibleData', 'contracts');

function setTimeoutPromise(duration) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

async function fetch(url) {
	return new Promise((resolve, reject) => {
		const req = https.request(url);
		req.on('response', (res) => {
			let body = '';
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(body);
			});
		});
		req.on('error', (err) => {
			reject(err);
		});
		req.end();
	});
}

async function tryEtherscanFetch(url) {
	let maxAttempts = 5;
	while (maxAttempts > 0) {
		maxAttempts--;
		const res = await fetch(url);
		const data = JSON.parse(res);
		if (data.status === '1') {
			return data.result;
		}
		await setTimeoutPromise(1000);
	}
	throw new Error(`Exhausted max attempts fetching Etherscan url`);
}

async function clean() {
	const filenames = await fs.readdir(contractsPath);
	await Promise.all(filenames.filter((filename) => {
		return /.json$/.test(filename);
	}).map((filename) => {
		return fs.unlink(path.join(contractsPath, filename));
	}));
}

async function build() {
	let apiKey;
	const APIKeyPath = path.join(rootPath, 'secrets', 'etherscanApiKey');
	try {
		apiKey = await fs.readFile(APIKeyPath, 'utf8');
	} catch (err) {
		console.log(`Couldn't find valid Etherscan API file at "${APIKeyPath}"`);
		apiKey = null;
	}

	await clean();

	const imports = [];
	const exports = [];
	for (const [name, address] of Object.entries(contractAddresses)) {
		let url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`;
		if (apiKey) {
			url += `&apikey=${apiKey}`;
		}
		const data = await tryEtherscanFetch(url);
		const dataFormatted = JSON.stringify(JSON.parse(data), null, '\t');
		const filename = `${name}ABI.json`;
		await fs.writeFile(path.join(contractsPath, filename), dataFormatted, 'utf8');
		imports.push(`import ${name} from './${filename}';`);
		exports.push(`	${name}: {
		address: '${address}',
		abi: ${name}
	}`);
		console.log(`Created ABI file for ${name}`);
	}

	const contractsJs = `${imports.sort().join('\n')}

const contracts = {
${exports.join(',\n')}
};

export default contracts;
`;
	await fs.writeFile(path.join(contractsPath, 'contracts.js'), contractsJs, 'utf8');

	console.log('Completed successfully!');
}

build().catch(console.error);
