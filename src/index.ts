import { WashingMachine } from './WashingMachine';
import { User } from './models/User';
import Ajv from 'ajv';
var ajv = new Ajv();

var wash = new WashingMachine('./datas');

var type = {
    name: 'Lavage sec',
    id: 1
}

var userTest = {
    id: 1,
    name: "hello"
}

console.log(wash.getUserByID(1))