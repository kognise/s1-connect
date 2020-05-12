const S1 = require('s1db')

module.exports = (connect) => {
	const Store = connect.Store || connect.session.Store
	const MemoryStore = connect.MemoryStore || connect.session.MemoryStore

	class S1Store extends Store {
		constructor({ token, baseUrl } = {}) {
			if (!token) {
				console.warn('No S1 token provided to the store, falling back to an in-memory store')
				return new MemoryStore()
			}

			super()
			this.db = new S1(token, baseUrl)
		}

		async getSession(sessionId) {
			const session = await this.db.get(sessionId)
			if (!session) return

			if (session.cookie) {
				const expires = typeof session.cookie.expires === 'string'
					? new Date(session.cookie.expires)
					: session.cookie.expires

				if (expires && expires <= Date.now()) {
					await this.db.delete(sessionId)
					return
				}
			}

			return session
		}

		async all(callback) {
			try {
				const sessionIds = await this.db.getKeys()
				const sessions = {}

				for (let sessionId of sessionIds) {
					const session = await this.getSession(sessionId)
					if (session) sessions[sessionId] = session
				}

				callback && callback(null, sessions)
			} catch (error) {
				callback && callback(error)
			}
		}

		async clear(callback) {
			// TODO: Speed up with a native method

			try {
				const sessionIds = await this.db.getKeys()

				for (let sessionId of sessionIds) {
					await this.db.delete(sessionId)
				}

				callback && callback()
			} catch (error) {
				callback && callback(error)
			}
		}

		async destroy(sessionId, callback) {
			try {
				await this.db.delete(sessionId)
				callback && callback()
			} catch (error) {
				callback && callback(error)
			}
		}

		async get(sessionId, callback) {
			try {
				const session = await this.getSession(sessionId)
				callback && callback(null, session)
			} catch (error) {
				callback && callback(error)
			}
		}

		async set(sessionId, session, callback) {
			try {
				await this.db.set(sessionId, session)
				callback && callback()
			} catch (error) {
				callback && callback(error)
			}
		}

		async touch(sessionId, session, callback) {
			try {
				const currentSession = await this.getSession(sessionId)

				if (currentSession) {
					currentSession.cookie = session.cookie
					await this.db.set(sessionId, currentSession)
				}

				callback && callback()
			} catch (error) {
				callback && callback(error)
			}
		}

		length(callback) {
			this.all((error, sessions) => {
				if (error) return callback && callback(error)
				callback && callback(null, Object.keys(sessions).length)
			})
		}
	}

	return S1Store
}