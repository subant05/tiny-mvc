function getHomeInfo(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve({msg: 'Welcome to the Home Page'})
        },500)
    })
}

function getAboutInfo(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve({msg: 'Hi. I am Anthony Crawford. JavaScript Developer, Father, Husband & Trekie'})
        },500)
    })
}

class HomeController extends tinyMVC.RouterController{
    constructor(data={}, state={}){
        super(...arguments)

        this.greeting = data.msg

        this.onmounted(()=>{
            document
            .getElementsByTagName("h1")[0]
            .addEventListener(
                "click"
                , e=>this.listHandler(e)
                , false
            )
        })

        this.onunmounted(()=>{
            this.state["/home"].didUserLeave = "User Left The Home Page."
            alert("Goodbye")
        })
    }

    listHandler(e){
        alert('Yes. I already welcomed you')
    }
}


class AboutController extends tinyMVC.RouterController{
    constructor(data={}, state={}){
        super(...arguments)

        this.me = data.msg

        this.onmounted(()=>{
            document
            .getElementsByTagName("h1")[0]
            .addEventListener(
                "click"
                , e=>this.listHandler(e)
                , false
            )
        })

        this.onunmounted(()=>{
            this.state["/home"].didUserLeave = "User Left The Home Page."
            alert("Goodbye")
        })
    }

    listHandler(e){
        alert('What else would you like to know about me?')
    }
}



tinyMVC.router({
    "/":{
        template: "/templates/home.html"
        , service: getHomeInfo
        , controller: HomeController
    }
    , "/about":{
        template: "/templates/about.html"
        , service: getAboutInfo
        , controller: AboutController
    }
})