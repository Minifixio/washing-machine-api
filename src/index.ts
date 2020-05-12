import { WashingMachine } from './WashingMachine';
import { WashingMachineServer } from './WashingMachineServer';
var wash = new WashingMachine('./datas');
var washServer = new WashingMachineServer(2000, 'machine')
