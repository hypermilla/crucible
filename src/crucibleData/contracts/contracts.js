import Aludel from './AludelABI.json';
import Crucible from './CrucibleABI.json';
import CrucibleFactory from './CrucibleFactoryABI.json';
import LPToken from './LPTokenABI.json';
import Transmuter from './TransmuterABI.json';

const contracts = {
	Crucible: {
		address: '0xCF576F74BA3B01CDC04E04305055446D1649BD07',
		abi: Crucible
	},
	CrucibleFactory: {
		address: '0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56',
		abi: CrucibleFactory
	},
	LPToken: {
		address: '0xCD6bcca48069f8588780dFA274960F15685aEe0e',
		abi: LPToken
	},
	Aludel: {
		address: '0xf0D415189949d913264A454F57f4279ad66cB24d',
		abi: Aludel
	},
	Transmuter: {
		address: '0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a',
		abi: Transmuter
	}
};

export default contracts;
