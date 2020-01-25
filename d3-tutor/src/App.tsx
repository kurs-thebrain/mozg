import React, {Component} from 'react'
import Graph from './Graph'
import D3Graph from "./D3Graph"
import data from './data.json'
import {GraphPropsType} from "./types"
import ButtonAppBar from "./NavPanel"

// Необходима запущенная бд, не нажимайте на новые кнопки monkaS

//Пример использования---------------------------
import * as schema from './schema';
// function CreateNode(label:String,content:String){
//     let newNode = schema.CreateNode(label,content);
//     return newNode;
// }


const Start = async () => {
    // await schema.CreateNode("Start", "something")
    // await schema.CreateChildNode(0, "Dev Team", "# Info\n - some\n - info")
    await schema.CreateChildNode(20, "Ruslan Khazbulatov", "# Links\n [VK](https://vk.com/almostz)")
    await schema.CreateChildNode(20, "Roman Armansky", "# Links\n [VK](https://vk.com/h4rdc0r33)")
    await schema.CreateChildNode(20, "Alexandra Rudenko", "# Links\n [VK](paste link here)")
    await schema.CreateChildNode(20, "Arman Davletov", "# Links\n [VK](paste link here)")
}

export default class App extends Component<any, GraphPropsType> {
    state = {
        width: 1000,
        height: 500,
        id: 'root'
    }

    render() {
        return (
            <div className="App">
                <ButtonAppBar/>
                <D3Graph/>
                <button onClick={()=>{Start()}}>Start up</button>
                <button onClick={()=>{schema.FindChildren(0).then(d=>{console.log(d)})}}>Log the data</button>
            </div>
        )
    }
}
