const Promise = require('bluebird')
const ua = require('universal-analytics')

module.exports = function(propertyId, _site, debug) {
	let ga = null

	return {
		boot: function() {
			if (ga) return
			ga = ua(propertyId, {
				strictCidFormat: false,
				https: true
			})

			if (debug) {
				ga = ga.debug()
			}
		},
		anonLogin: function() {
			this.boot()
		},
		login: function(userId) {
			this.boot()
			ga.set('uid', userId)
		},
		logout: function() {
			ga = null
		},
		track: function(category, action, label) {
			// if called before `login` create the object with the random ID
			this.boot()
			return Promise.fromCallback(function (callback) {
				ga.event(category, action, label, undefined, callback)
			})
		}
	}
}
