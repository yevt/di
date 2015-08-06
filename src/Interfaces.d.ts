/**
 * Created by y.evtushenko on 07.08.15.
 */
interface ContextConfig {

}

interface DependencyConfig {
    id:string;
    func:Function;
    dependencies?:string[];
}