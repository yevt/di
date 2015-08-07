/**
 * Created by y.evtushenko on 07.08.15.
 */
interface ContextOptions {

}

interface ComponentOptions {
    id:string;
    func:Function;
    dependencies?:string[];
}

interface IComponent {
    //new(options:ComponentOptions):IComponent
    getService(dependantServices:any[]):Q.Promise<any>;
    getOptions():ComponentOptions;
}

interface IContext {
    destroy();
    register(options:ContextOptions);
    get(id:string):Q.Promise<any>;
    hasDependency(id:string):boolean;
}