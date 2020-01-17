import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

class TextAr extends Component {
    constructor (props) {
        super(props)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
      }
      
    componentWillMount() {
        document.addEventListener('click', this.handleClickOutside, false);
      }
      
    handleClickOutside = (event) => {
          const domNode = ReactDOM.findDOMNode(this);
      
          if ((!domNode || !domNode.contains(event.target))) {
              this.props.setHide()
          }
      }

    render() {
        return (
            <textarea value={this.props.value} onChange={(e) => this.props.setMarkdown(e.target.value)}/>
        )
    }

}

export default class Note extends Component {
    constructor(props) {
        super(props)
        this.state = { isEditable:true }
    }

    

    render() {
        const render = this.state.isEditable ? 
        <div onClick={() => this.setState({isEditable : false})}><ReactMarkdown>{this.props.markdown}</ReactMarkdown></div> : 
        <TextAr value={this.props.markdown} setMarkdown={this.props.setMarkdown} setHide={()=> this.setState({isEditable:true})} />
        return (render)
    }
}