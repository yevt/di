/**
 * Created by y.evtushenko on 07.08.15.
 */

declare type Service = any;
declare type ComponentId = string;

interface IComponentOptions {
    id:ComponentId;
    func:Function;
    dependencies?:ComponentId[];
}

interface IComponent {
    getService(dependantServices?:Service[]):Q.Promise<Service>;
    getOptions():IComponentOptions;
}

interface IContextOptions {
    components: IComponentOptions[];
}

interface IContext {
    destroy();
    registerComponent(options:IComponentOptions);
    hasComponent(id:ComponentId):boolean;
    get(id:ComponentId):Q.Promise<Service>;
}

