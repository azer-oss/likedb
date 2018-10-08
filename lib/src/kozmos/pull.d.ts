declare const Pull: any;
declare const PostQueue: any;
declare class PullForServers extends Pull {
    constructor(servers: any, options: any);
    receive(updates: any, callback: any): void;
}
