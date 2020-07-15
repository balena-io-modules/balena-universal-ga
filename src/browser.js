if (window.ga === undefined) {
	require('../vendor/ga-loader');
}

const TRACKER_NAME = 'resinAnalytics';

module.exports = function (propertyId, site, debug) {
	let booted = false;

	return {
		boot: function () {
			if (booted) {
				return;
			}
			const options = {};

			if (debug) {
				options.cookieDomain = 'none';
			}

			window.ga('create', propertyId, site, TRACKER_NAME, options);
			booted = true;
		},
		anonLogin: function () {
			this.boot();
		},
		login: function (userId) {
			this.boot();
			window.ga(TRACKER_NAME + '.set', 'userId', userId);
		},
		logout: function () {
			return new Promise(function (resolve) {
				window.ga(function () {
					if (booted) {
						window.ga.remove(TRACKER_NAME);
						booted = false;
					}
					resolve();
				});
			});
		},
		track: function (category, action, label, data) {
			this.boot();
			let timeout;
			return new Promise(function (resolve, reject) {
				const options = {
					hitCallback: resolve,
				};
				if (debug) {
					options.transport = 'xhr';
				}

				if (action === 'Page Visit') {
					window.ga(
						TRACKER_NAME + '.set',
						'page',
						data.url || window.location.pathname,
					);
					window.ga(TRACKER_NAME + '.send', 'pageview', data);
					// the hitCallback option isn't fired when calling hitType `pageview`
					// so we manually call callback()
					resolve();
				} else {
					window.ga(
						TRACKER_NAME + '.send',
						'event',
						category,
						action,
						label,
						options,
					);
				}
				timeout = setTimeout(() => reject(new Error('Timed out')), 1000);
			}).then(() => {
				clearTimeout(timeout);
			});
		},
	};
};
