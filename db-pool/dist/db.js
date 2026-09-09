"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
class TCPConnection {
    constructor(id) {
        this._id = id;
    }
    query(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Connection ${this._id} : running ${sql}`);
            yield new Promise((resolve) => setTimeout(() => {
                resolve();
            }, 2000));
            console.log(`Connection ${this._id} : query finished`);
        });
    }
}
class ConnectionPool {
    constructor(max) {
        this._max = max;
        this._totalCreated = 0;
        this._connections = [];
        this._available = [];
        this._waiting = [];
    }
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = new TCPConnection(++this._totalCreated);
            this._connections.push(connection);
            console.log(`TCP connection with id : ${connection._id} created`);
            return connection;
        });
    }
    acquire() {
        return __awaiter(this, void 0, void 0, function* () {
            //1. reuse available connectio if present
            if (this._available.length > 0) {
                const connection = this._available.pop();
                console.log(`Acquired Connection with id ; ${connection === null || connection === void 0 ? void 0 : connection._id}`);
                return connection;
            }
            //2. create new connection if pool isn't full and give it back
            if (this._connections.length < this._max) {
                const connection = yield this.createConnection();
                console.log(`Acquired Connection with id : ${connection._id}`);
                return connection;
            }
            //3. pool is full wait for availablity
            console.log("Pool exhausted. Request waiting...");
            return new Promise((resolve) => {
                this._waiting.push(resolve);
            });
        });
    }
    release(connection) {
        console.log(`Releasing connection ${connection._id}....`);
        if (this._waiting.length > 0) {
            const resolve = this._waiting.shift();
            console.log(`Giving connection ${connection._id} to waiting request`);
            resolve(connection);
            return;
        }
        //nobody waiting
        this._available.push(connection);
    }
}
exports.ConnectionPool = ConnectionPool;
