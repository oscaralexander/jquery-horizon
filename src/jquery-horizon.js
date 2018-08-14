/**
 * jQuery Horizon
 * Copyright © 2018, Alexander Griffioen <mail@oscaralexander.com>
 * Published under MIT license.
 */

const pluginName = 'horizon'

class Horizon {
    constructor(el, options) {
        this.options = $.extend({}, this.defaults, options)
        this.$el = $(el)
        this.init()
    }

    init() {
        window.horizon = window.horizon || {}
        window.horizon.scrollY = window.horizon.scrollY || 0
        window.horizon.targets = window.horizon.targets || []

        if ('IntersectionObserver' in window) {
            if (typeof window.horizon.io !== 'function') {
                window.horizon.io = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        $(entry.target)[entry.isIntersecting ? 'addClass' : 'removeClass'](this.options.classNameIsInView)
                    })
                })
            }
        } else {
            this.$el.addClass(this.options.classNameIsInView)
        }

        window.horizon.targets.push({
            $el: this.$el,
            height: this.$el.height(),
            top: this.$el.offset().top
        })

        window.horizon.io.observe(this.$el.get(0))
        this.$el.addClass(this.options.classNameIsInView)
        window.requestAnimationFrame(this.onRequestAnimationFrame.bind(this))

        $(window).on('load orientationchange resize', () => this.update())
    }

    onRequestAnimationFrame() {
        const scrollY = window.scrollY
        let y

        if (window.horizon.scrollY !== scrollY) {
            window.horizon.targets.forEach(el => {
                if (el.$el.hasClass(this.options.classNameIsInView)) {
                    y = ((window.scrollY + window.innerHeight) - el.top) / (window.innerHeight + el.height)

                    if (y >= 0 && y <= 1) {
                        y = (y * 2) - 1
                        el.$el.trigger(this.options.eventNameScroll, [y])
                    }
                }
            })

            window.horizon.scrollY = window.scrollY
        }

        window.requestAnimationFrame(this.onRequestAnimationFrame.bind(this))
    }

    update() {
        let $el

        for (let i = 0; i < window.horizon.targets.length; i++) {
            $el = window.horizon.targets[i].$el
            window.horizon.targets[i].height = $el.height()
            window.horizon.targets[i].top = $el.offset().top
        }
    }
}

Horizon.prototype.defaults = {
    classNameIsInView: 'is-inView',
    eventNameScroll: 'horizon:scroll'
}

$.fn[pluginName] = function(options) {
    return this.each((i, el) => {
        const instance = $(el).data(`plugin_${pluginName}`) || null

        if (!instance) {
            $(el).data(`plugin_${pluginName}`, new Horizon(el, options))
        } else {
            if (typeof options === 'string') {
                instance[options]()
            }
        }
    })
}