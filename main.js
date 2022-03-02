
"use strict";

import {DOM} from '../../base/dom.js'
import {command} from '../../base/command.js'
import {storage} from '../../base/storage.js'
import {Pipes} from '../../base/navigation.js'

import {project} from '../project/main.js'

/* Page that handles a dashboard insided an iFrame. */
class Freeboard {
  /* Construct the object, is executed on load of the window. */
  constructor (){
    this.name = 'freeboard'   // Same name of the class, but in lower case
    this.inited = false       // If the page is in initiated state
    this._inited = false      // If page has inited for the first time
    this.ipipes = {}          // Store references to iframe's methods
    this.buffer = ''          // Stora incoming chunks

    this.tree                 // Store dashboard on load and interval only,
                              // freeboard has no on change event to keep on sync...

    let $ = this.$ = {}       // Store DOM objects here.

    $.iframe = new DOM('iframe')
    $.section = new DOM(DOM.get(`section#${this.name}`))
      .append([$.iframe])
  }
  /* On display, initiates the page. */
  init (){
    // Run once
    if (!this._inited){
      this.$.iframe.onevent('load', this, () => {
        // Alias some functions
        this.ipipes.serialize = this.$.iframe.$.contentWindow.freeboard.serialize
        this.ipipes.load = this.$.iframe.$.contentWindow.freeboard.loadDashboard

        this.ipipes.loaded = true

        this.ipipes.load(this.tree)

        // Init a watcher to kinda regularly store changes to project
        // Freeboard has no on change event
        this.interval = setInterval(() => {
          if (this.inited)
            this.save()
        }, 2000)
      })
      this.$.iframe.src = 'static/page/freeboard/index.html',
      this._inited = true
    }

    if (this.inited)
      return

    // Do stuff to initiate the page's user interface

    this.inited = true
  }
  /* On hidden, deinitiate the page. */
  deinit(){
    if (!this.inited)
      return

    // Do stuff to deinitiate the page's user interface

    this.inited = false
  }
  /*
   * On load a project, load the blocks' scope of the project.
   * @param {Object} obj - page's scope of the project.
   * @param {Object} tabUID - Identifier of the tab/window.
   */
  load (obj, tabUID){
    let inited = this.inited
    // Deinit if loaded with another project.
    if (this.inited)
      this.deinit()

    // Update page's scope of the project
    this.tree = obj.tree


    // If page visible, init page's scope of the project.
    if (inited)
      this.init()
  }
  /**
   * Create this page's scope to be included in the project file.
   * @return {Object} This page's scope object.
   */
  empty (){
    return {
      tree:{}     // Store freeboard inside ``tree'' object.
    }
  }
  /**
   * Store current dashboard in the project file on tab unload and interval.
   * Is buggy because freeboard has no on change event.
   */
  save (){
    project.current.freeboard.tree =  this.ipipes.serialize()
    this.tree = project.current.freeboard.tree
    project.write()
  }
}

// Init and export freeboard object
export let freeboard = new Freeboard()
