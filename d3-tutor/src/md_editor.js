import React, { Component } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import abbreviation from 'markdown-it-abbr'
import insert from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import tasklists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

export default class MarkdownEditor extends Component {
    mdEditor = null
    mdParser = null
    constructor(props) {
        super(props)
        this.mdParser = new MarkdownIt({
            html:true,
            linkify:true,
            typographer:true,
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value
                    } catch (__) {}
                }
                return ''
            }
        })
            .use(emoji)
            .use(subscript)
            .use(superscript)
            .use(footnote)
            .use(deflist)
            .use(abbreviation)
            .use(insert)
            .use(mark)
            .use(tasklists, { enabled: this.taskLists })
        this.renderHTML=this.renderHTML.bind(this)
    }
    handleImageUpload(file, callback) {
        const reader = new FileReader()
        reader.onload = () => {
            const convertBase64UrlToBlob = (urlData) => {
                let arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1]
                let bstr = atob(arr[1])
                let n = bstr.length
                let u8arr = new Uint8Array(n)
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                return new Blob([u8arr], {type:mime})
            }
            const blob = convertBase64UrlToBlob(reader.result)
            setTimeout(() => {
                const uploadedUrl = 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=2ahUKEwj96pWz18XmAhXx-yoKHaJrDbIQjRx6BAgBEAQ&url=https%3A%2F%2Fmemepedia.ru%2Fkartinki-nichosi%2F&psig=AOvVaw2Qr77P3SGrkgT3UzMUIh10&ust=1576981329709813'
                callback(uploadedUrl)
            }, 1000)
        }
        reader.readAsDataURL(file)
    }
    onCustomImageUpload = () => {
        return new Promise((resolve, reject) => {
            const result = window.prompt('Please enter image url here')
            resolve({ url: result })
        })
    }
    renderHTML(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.mdParser.render(text))
            }, 1000)
        })
    }
    render() {
        return(
            <div style={{height:'400px'}}>
                <MdEditor
                    value={'It test mdEditor'}
                    ref={node => this.mdEditor=node}
                    renderHTML={this.renderHTML}
                    style={{height:'300px'}}
                    config={{
                        view: {
                            menu:true,
                            md:true,
                            html:true,
                            fullScreen:true
                        }
                    }}
                    onImageUpload={this.handleImageUpload}
                    onCustomImageUpload={this.onCustomImageUpload}
                />
            </div>
        )
    }
}