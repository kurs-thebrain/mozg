import React, {Component, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import IconButton from "@material-ui/core/IconButton"
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import TextareaAutosize from 'react-textarea-autosize'


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
            <TextareaAutosize
                className="note-textarea"
                value={this.props.value}
                onChange={(e) => this.props.setMarkdown(e.target.value)}
                placeholder="Описание...."
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

    useEffect(() => {
        props.setMarkdown(markdown)
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

    const iconDelSave = isEditable ?
        <CreateIcon style={{color:"white"}}/>:
        <SaveIcon style={{color:"white"}}/>

    return (
        <div>
            <div className="note-hat">
                <a style={{color:"white"}}>{props.label}</a>
                <span className="note-hat-button">
                    <IconButton onClick={() => setIsEditable(!isEditable)}>
                        {iconDelSave}
                    </IconButton>
                    <IconButton onClick={props.deleteNode}>
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