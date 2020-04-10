import LoaderCircular from '../loaders'
import {_ieParseTemplate, _decorateDefineController} from './router.Utils'
import RouterController from './router.Controller'

class Router {
    constructor(routes, state, root, config = { saveState:true}){
        this.routes = routes;
        this.state = state;
        this.root =  root;
        this.saveState = config.saveState;
        this.addClickHandler()
        this.addPopstateHandler()
        this.pageLoadHander(root)
    }

    addClickHandler(){
        document.addEventListener("click",event=>this.pushStateHandler(event, this.state, this.routes))
    }

    addPopstateHandler(){
        window.addEventListener("popstate", event=>this.historyHandler(event, this.state, this.routes))
    }

     insertPageLoader(){
        const loaderNode = document.createElement("div")
        const content = document.querySelector("#content")
        content.innerHTML = ""
        content.appendChild(loaderNode)
        LoaderCircular.show(loaderNode)
        return loaderNode;
    }

    parseTemplate(scope,template){
        return _ieParseTemplate(template,scope)
    }

    async getTemplate(path){
        const template = ''

        if(this.routes[path].template && typeof this.routes[path].template === "string"){
            return new Promise((resolve, reject)=>{
                const xhr =  new XMLHttpRequest()
                xhr.open("get", this.routes[path].template, true)
                xhr.onload = ()=>{
                    resolve(xhr.responseText)
                }
                xhr.onerror = ()=>{
                    reject(xhr.responseText)
                }
                xhr.send()
            })
        }

        return template
    }

    async loadService(path){
        let serviceData = {}

        if(typeof this.routes[path].service === "function"){
            serviceData = await this.routes[path].service(this.state[path])
        }

        return serviceData
    }

    executeController(path, serviceData, template){
        const Renderer = _decorateDefineController(this.routes[path].controller,template,this)

        return new Renderer(Object.assign(Object.create(this.state[path]),serviceData), this.state ).mounted()
    }

    add404Route(){
        if(!this.routes[`${this.root}/404`]){
            this.routes[`${this.root}/404`]  = { controller: class PageNotFound extends RouterController{}}
            this.state[`${this.root}/404`] = {}
        }
    }

    render404(){
        this.add404Route()
        this.executeController(`${this.root}/404`, {}, "<div>404 - Page Not Found</div>")
    }

    is404Error(path){
        if(typeof this.routes[path] === "undefined"){
            this.render404();
            return true;
        }

        return false;
    }

    async routerRender(path){
        if(this.is404Error(path)){
            return;
        }

        let loader = this.insertPageLoader()
        const serviceData = await this.loadService(path)
        const template = await this.getTemplate(path)

        if(this.saveState){
            localStorage.setItem("routerState", JSON.stringify(this.state))
        }

        if(this.state.currentState) {
            this.state.currentState.unmounted()
        }

        this.state.currentState = this.executeController(path, serviceData, template)

        loader = null;
    }

    async historyHandler(event){
        if(typeof event.state !== "object" || !(event.state.path in this.routes)){
            return;
        }

        if(typeof this.state[event.state.path] !== "object" && this.saveState){
            this.state[event.state.path] = {}
        }

        this.routerRender(event.state.path)
    }

     pushStateHandler(event){
        if(event.target.tagName.toLowerCase() === "a"){
            event.preventDefault();

            if(event.target.href.includes("#")){
                event.preventDefault();
                return;
            }

            this.state[event.target.pathname] = {}
            history.pushState({
            path:event.target.pathname
            }
            , event.target.title
            , event.target.pathname)

            this.routerRender(event.target.pathname)
        }
    }

     redirect(path) {
        this.state[path] = {}
        history.pushState({ path }  , ""  , path)
        this.routerRender(path)
    }

     replaceState(path){
        this.state[path] = {}
        history.replaceState({ path }  , ""  , path)
        this.routerRender(path)
    }

    pageLoadHander(path){
        if(location.pathname && location.pathname !== "/"  && location.pathname !== this.root ) {
            const savedState = JSON.parse(localStorage.getItem("routerState"))
            if(savedState && this.saveState){
                this.state = JSON.parse(localStorage.getItem("routerState"))
                localStorage.removeItem("routerState")
            }
            this.replaceState(location.pathname)
        } else {
            this.replaceState(path)
        }
    }
}

function router(routes,root = "/"){
    new Router(routes, {root}, root)
}

/** Example:
   var state = router({
      "/hello":{
              service(){
                  return new Promise((resolve,reject)=>{
                      setTimeout(resolve({greetings:"Salutations"}), 1000)
                  })
              }
              , controller(data){
                  console.log("hello: ", data)
                  document.querySelector("#content").innerHTML = data.greetings
              }
          }
      , "/bye":{
              service(){
                  return new Promise((resolve,reject)=>{
                      setTimeout(resolve({farewell:"Adios"}), 1000)
                  })
              }
              , controller(data){
                  console.log("bye: ", data)
                  document.querySelector("#content").innerHTML = data.farewell
              }
      }
  })
*/

export { router, RouterController }
