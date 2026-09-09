class TCPConnection {
  readonly _id: number;
  constructor(id: number) {
    this._id = id;
  }

  async query(sql: string) {
    console.log(`Connection ${this._id} : running ${sql}`);

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, 2000),
    );
    console.log(`Connection ${this._id} : query finished`);
  }
}

export class ConnectionPool {
  private readonly _max: number;
  private _totalCreated: number;

  private readonly _connections: TCPConnection[];
  private readonly _available: TCPConnection[];
  private readonly _waiting: ((connection: TCPConnection) => void)[];

  constructor(max: number) {
    this._max = max;
    this._totalCreated = 0;

    this._connections = [];
    this._available = [];
    this._waiting = [];
  }

  private async createConnection(): Promise<TCPConnection> {
    const connection = new TCPConnection(++this._totalCreated);
    this._connections.push(connection);
    console.log(`TCP connection with id : ${connection._id} created`);
    return connection;
  }

  async acquire() {
    //1. reuse available connectio if present
    if (this._available.length > 0) {
      const connection = this._available.pop();
      console.log(`Acquired Connection with id ; ${connection?._id}`);

      return connection;
    }

    //2. create new connection if pool isn't full and give it back

    if (this._connections.length < this._max) {
      const connection = await this.createConnection();
      console.log(`Acquired Connection with id : ${connection._id}`);
      return connection;
    }

    //3. pool is full wait for availablity
    console.log("Pool exhausted. Request waiting...");

    return new Promise<TCPConnection>((resolve) => {
      this._waiting.push(resolve);
    });
  }

  release(connection: TCPConnection) {
    console.log(`Releasing connection ${connection._id}....`);

    if (this._waiting.length > 0) {
      const resolve = this._waiting.shift()!;
      console.log(`Giving connection ${connection._id} to waiting request`);

      resolve(connection);
      return;
    }

    //nobody waiting
    this._available.push(connection);
  }
}
