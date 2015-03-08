/**
 * LazyTag
 *
 * @author Marius Naumann
 * @lincense MIT
 */
window.LazyTag = (function() {
    'use strict';

    var Tag = function(id, selector, html) {
        this.id = id;
        this.selector = selector;
        this.html = html;
    };



    var LazyTag = function() {
        this.eventRegistry = {};
        this.tagRegistry = {};
    };
    LazyTag.prototype.hasEvent = function(type) {
        return type in this.eventRegistry;
    };
    LazyTag.prototype.hasTag = function(id) {
        return id in this.tagRegistry;
    };
    LazyTag.prototype.registerEvent = function(type, object) {
        if(this.hasEvent(type)) { console.error('Cannot register event because type [' + type + '] is already in use. Ignoring!');return; }

        this.eventRegistry[type] = object;
        object.activate(this);
    };
    LazyTag.prototype.registerTag = function(tagId, selector, html) {
        if(this.hasTag(tagId)) { console.error('Cannot register tag because id [' + tagId + '] is already in use. Ignoring!');return; }

        var tag = new Tag(tagId, selector, html);
        this.tagRegistry[tagId] = tag;
        return tag;
    };
    LazyTag.prototype.invoke = function(tagId) {
        if(!this.hasTag(tagId)) { console.error('Cannot invoke specified tag because id [' + tagId + '] could not be found. Ignoring!');return; }

        var tag = this.tagRegistry[tagId];

        var container = document.querySelector(tag.selector);
        container.innerHTML = ''; // TODO: Should only be done, when set in global LazyTag settings.

        postscribe(container, tag.html);
    };
    LazyTag.prototype.invokeOn = function(eventType, tagId) {
        if(!this.hasEvent(eventType)) { console.error('Cannot register tag to unknown event type [' + eventType + ']. Ignoring!');return; }

        var tag = this.tagRegistry[tagId];
        var eventObject = this.eventRegistry[eventType];
        eventObject.handleTag(tag);
    };



    var DomReadyEventTagInvoker = function() {
        this.handledTags = ['asdasd'];
        this.fired = false;
    };
    DomReadyEventTagInvoker.prototype.activate = function(tagManager) {
        this.tagManager = tagManager;

        var self = this;
        document.addEventListener('DOMContentLoaded', function() {
            self.fired = true;
            for(var idx in self.handledTags) {
                var tag = self.handledTags[idx];
                self.tagManager.invoke(tag.id);
            }
        });
    };
    DomReadyEventTagInvoker.prototype.handleTag = function(tag) {
        this.handledTags.push(tag);
        
        if(this.fired) {
            this.tagManager.invoke(tag.id);
        }
    };


    var LoadEventTagInvoker = function() {
        this.handledTags = [];
        this.fired = false;
    };
    LoadEventTagInvoker.prototype.activate = function(tagManager) {
        this.tagManager = tagManager;

        var self = this;
        window.addEventListener('load', function() {
            self.fired = true;
            for(var idx in self.handledTags) {
                var tag = self.handledTags[idx];
                self.tagManager.invoke(tag.id);
            }
        });
    };
    LoadEventTagInvoker.prototype.handleTag = function(tag) {
        this.handledTags.push(tag);
        if(this.fired) {
            this.tagManager.invoke(tag.id);
        }
    };



    // setup
    return (function() {
        var instance = new LazyTag();

        instance.registerEvent('domReady', new DomReadyEventTagInvoker());
        instance.registerEvent('load', new LoadEventTagInvoker());

        return instance;
    }());
})();

