import React, { Component, useState } from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import IconButton from "@material-ui/core/IconButton"
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete'

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

        if ((!domNode || !domNode.contains(event.target)) && this.props.value) {
            this.props.setHide()
        }
    }

    render() {
        return (
            <textarea
                className="note-textarea"
                value={this.props.value}
                onChange={(e) => this.props.setMarkdown(e.target.value)}
            />
        )
    }

}

const Note = (props) => {
    const [markdown, setMarkdown] = useState(() => {
        if (props.markdown)
            return props.markdown
        return '# Erorr'
    })
    const [isEditable, setIsEditable] = useState(() => {
        if (props.markdown)
            return true
        return false
    })

    const Text = isEditable ?
        <div onClick={() => setIsEditable(false)}>
            <ReactMarkdown className="note-markdown">
                {markdown}
            </ReactMarkdown>
        </div>:
        <TextAr
            value={markdown}
            setMarkdown={setMarkdown}
            setHide={() => setIsEditable(true)}
        />

    return (
        <div>
            <div className="note-hat">
                <a style={{color:"white"}}>{props.label}</a>
                <span className="note-hat-button">
                    <IconButton onClick={() => setIsEditable(false)}>
                        <CreateIcon style={{color:"white"}}/>
                    </IconButton>
                    <IconButton>
                        <DeleteIcon style={{color:"white"}}/>
                    </IconButton>
                </span>
            </div>
            <div className="note-body">
                {Text}
            </div>
        </div>
    )
}

export default Note