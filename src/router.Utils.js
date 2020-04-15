function createEvent(eventType){
    if(!window.Event){
        return document.createEvent(eventType)
    }

    return new Event(eventType)
}

const  _ieGetScopedProperty =(function R(currentScope, path, value) {
    if (typeof path === 'string'){
        path = path.replace("scope.","").split('.')
    } 

    if (path.length === 1 && typeof value !== "undefined"){
        return currentScope[path[0]] = value;
    } else if (!path.length){
        return currentScope
    } else {
        const property = path.shift()

        if(typeof value !== "undefined" && typeof currentScope[property] === "undefined") {
            currentScope[property]={}
        }

        return R(currentScope[property],path, value)
    }
})

function templateTranspiler(template,scope ){
    return template.replace(/\$\{(.+?)\}/g
        ,(currentMatch, path)=>{
            return _ieGetScopedProperty(scope, path)
        })
}

function _bindOnmountedEvents(){
    if(this.onmountedHandlers.length){
        this.onmountedHandlers.forEach(func=>{
            this.onmounted(func)
        })
        delete this.onmountedHandlers
    }
}

function _bindUnnmountedEvents(){
    if(this.onunmountedHandlers.length){
        this.onunmountedHandlers.forEach(func=>{
            this.onunmounted(func)
        })
        delete this.onunmountedHandlers
    }
}

function decorateDefineController(controller, template, that){
    const pipeline = document.createElement("div")
    const eventTypes = {
        mounted:"mounted"
        , unmounted: "unmounted"
    }

    class Renderer extends controller {
        constructor(data, state){
            super(data, state)

            _bindOnmountedEvents.call(this)
            _bindUnnmountedEvents.call(this)

            this.insertHTML()
        }

        mounted(){
            const event = createEvent(eventTypes.mounted);
            pipeline.dispatchEvent(event)
            this.mounted = null
        }

        onmounted(func){
            pipeline.addEventListener(eventTypes.mounted, e=>func(e), false)
        }

        unmounted(){
            const event = createEvent(eventTypes.unmounted);
            pipeline.dispatchEvent(event)
            this.unmounted = null
        }

        onunmounted(func){
            pipeline.addEventListener(eventTypes.unmounted, e=>func(e), false)
        }

        toggleSubmitButton(){
            if(!this.submitButton){
                this.submitButton = this.form.querySelector(["[type='submit']"]);
            }

            const disabled = this.submitButton.disabled
            this.submitButton.disabled = disabled ? false : true
        }

        insertHTML(){
            document.querySelector("#content").innerHTML = that.parseTemplate(this, template);
        }

        routerRedirect(newPath){
            if(!newPath.includes(that.root)){
                newPath = newPath.charAt(0) === '/' ? newPath : '/'.concat(newPath)
                newPath = that.root.concat(newPath).replace("//","/")
            }

            that.redirect(newPath)
        }
    }

    return Renderer;
}

export {templateTranspiler, decorateDefineController}
