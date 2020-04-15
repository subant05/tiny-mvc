export default class RouterController {
    constructor(data,state){
        this.onmountedHandlers = []
        this.onunmountedHandlers = []
    }

    onunmounted(handler){
        this.onunmountedHandlers.push(handler)
    }

    onunmounted(handler){
        this.onunmountedHandlers.push(handler)
    }

    toggleSubmitButton(){
        throw new Error("Define toggleSubmitButton")
    }

    routerRedirect(){
        throw new Error("Define routerRedirect")
    }
}
