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
                className={this.props.className}
                value={this.props.value}
                onChange={(e) => this.props.setValue(e.target.value)}
                placeholder={this.props.placeholder}
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

    const [isEditableLabel, setIsEditableLabel] = useState(() => {
        if (props.label)
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
            className="note-textarea"
            value={markdown}
            setValue={setMarkdown}
            setHide={() => setIsEditable(true)}
            placeholder="Описание...."
        />

    const iconDelSave = isEditable ?
        <CreateIcon style={{color:"white"}}/>:
        <SaveIcon style={{color:"white"}}/>

    const changeLabel = isEditableLabel ?
        <a
            onClick={() => setIsEditableLabel(false)}
            style={{color:"white"}}
        >
            {props.label}
        </a>:
        <TextAr
            className="note-hat-label"
            value={props.label}
            setValue={props.setLabel}
            setHide={() => setIsEditableLabel(true)}
            placeholder="Мысль..."
        />

    return (
        <div>
            <div className="note-hat">
                { changeLabel }
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