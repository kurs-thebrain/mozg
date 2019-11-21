import React, {Component} from 'react'

const Content = (props:any) => {
    console.log(props)
    return <h1>{props.content}</h1>
}

export default Content