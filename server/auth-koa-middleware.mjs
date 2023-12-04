import 'dotenv/config'
import session from 'koa-session'
import koaRouter from 'koa-router'
import userAuth from 'koa-userauth'
import { koaBody } from 'koa-body'
import koaSocketIO from 'koa-socket-2'
import { initDb, getUser, getUsers, updateUser } from './db.mjs'

import { initApp, syncUser, getUserToken, getNotifications, markNotifications, readNotification, unreadNotification, sendMessage } from './web-api.mjs'

const router = koaRouter()
let koaIO;

export const getUid = (username) => {
    return `acmeuser-${username}`
}

export const initDatabase = async () => {
    const users = await initDb();    
    
    // sync all users to Weavy
    users.forEach(async (user) => {
        const uid = await getUid(user.username)
        await syncUser({
            uid,            
            name: user.name,          
            picture: user.avatar,  
            directory: 'ACME',
        })
    });
}

router.get('/api/test', (ctx) => {
    ctx.body = { hello: 'WORLD' }
})

router.get('/api/uid', (ctx) => {
    ctx.body = { uid: ctx.session.uid }
})

router.get('/api/user', (ctx) => {
    ctx.body = ctx.session.user
})

router.get('/api/token', async (ctx) => {
    const uid = ctx.session.uid // get user from session
    const refresh = ctx.query.refresh && ctx.query.refresh !== 'false'
    ctx.body = await getUserToken({ uid, refresh })
})

router.get('/api/contextual/:id', async (ctx) => {
    // setup contextual app
    ctx.body = await initApp({
        uid: ctx.request.params.id,
        name: ctx.request.params.id,
        type: ctx.query.type,
        userId: ctx.session.uid,
    })
})

router.post('/api/examples/messages', async (ctx) => {
    ctx.body = await sendMessage({
        id: ctx.request.body.id,
        text: ctx.request.body.text        
    })
})

router.get('/api/notifications/mark', async (ctx) => {
    const uid = ctx.session.uid // get user from session

    if (uid) {
        const { access_token } = await getUserToken({ uid })
        try {
            ctx.body = await markNotifications({ access_token })
        } catch(e) {
            if (e.cause?.status === 401) {
                const { access_token } = await getUserToken({ uid, refresh: true })
                console.log("Notification token expired")
                try {
                    ctx.body = await markNotifications({ access_token })
                } catch(e) {
                    console.error("Mark notifications as read failed", e.cause.status)
                }
            } else {
                console.error("Mark notifications as read failed", e.cause.status)
            }
        }
    }
})

router.get('/api/notifications/:id/mark', async (ctx) => {
    const uid = ctx.session.uid // get user from session
    const id = ctx.request.params.id;

    if (uid) {
        const { access_token } = await getUserToken({ uid })
        try {
            ctx.body = await readNotification({ id, access_token })
        } catch(e) {
            if (e.cause?.status === 401) {
                const { access_token } = await getUserToken({ uid, refresh: true })
                console.log("Notification token expired")
                try {
                    ctx.body = await readNotification({ id, access_token })
                } catch(e) {
                    console.error("Mark single notification as read failed", e.cause.status)
                }
            } else {
                console.error("Mark signle notification as read failed", e.cause.status)
            }
        }
    }
})

router.get('/api/notifications/:id/unmark', async (ctx) => {
    const uid = ctx.session.uid // get user from session
    const id = ctx.request.params.id;

    if (uid) {
        const { access_token } = await getUserToken({ uid })
        try {
            ctx.body = await unreadNotification({ id, access_token })
        } catch(e) {
            if (e.cause?.status === 401) {
                const { access_token } = await getUserToken({ uid, refresh: true })
                console.log("Notification token expired")
                try {
                    ctx.body = await unreadNotification({ id, access_token })
                } catch(e) {
                    console.error("Mark single notification as unread failed", e.cause.status)
                }
            } else {
                console.error("Mark signle notification as unread failed", e.cause.status)
            }
        }
    }
})


router.get('/api/notifications', async (ctx) => {
    const uid = ctx.session.uid // get user from session
    const count_only = ctx.query.count_only
    const unread = ctx.query.unread

    if (uid) {
        const { access_token } = await getUserToken({ uid })

        try {
            ctx.body = await getNotifications({ access_token, count_only, unread })
        } catch(e) {
            if (e.cause?.status === 401) {
                const { access_token } = await getUserToken({ uid, refresh: true })
                console.log("Notification token expired")
                try {
                    ctx.body = await getNotifications({ access_token, count_only })
                } catch(e) {
                    console.error("Get notifications failed", e.cause.status)
                }
            } else {
                console.error("Get notifications failed", e.cause.status)
            }
        }

    }
})

router.get('/api/users', async (ctx) => {
    try {
        ctx.body = await getUsers()
    } catch(e) {            
        console.error("Get users failed")
    }
})

router.get('/api/profile', async (ctx) => {
    const username = ctx.session.user.username 
    
    try {
        ctx.body = await getUser(username)
    } catch(e) {            
        console.error("Get profile failed")
    }
})

router.post('/api/profile', async (ctx) => {
    const username = ctx.session.user.username 
    const uid = ctx.session.uid 
    
    try {
        var data = await getUser(username)
        if(data){
            data.name = ctx.request.body.name
            data.phone_number = ctx.request.body.phone_number
            await updateUser(username, data)
            const updated = await getUser(username)

            // sync new user data to Weavy
            syncUser({uid: uid, name: updated.name, email: updated.email, phone_number: updated.phone_number})
            
            ctx.session.user.name = updated.name;
            ctx.body = updated
        }
    } catch(e) {            
        console.error("Save profile failed")
    }
})

router.get('/api/socket', async (ctx, next) => {
    if (ctx.socket) {
        ctx.status = 200
    } else {
        throw new Error('Socket not started')
    }
})

router.post('/webhooks', (ctx) => {        
        
    const { action, actor, notification } = ctx.request.body
    
    switch (action) {
        case 'notifications_marked': 
            koaIO.to(actor.uid).emit(action)            
        break
        case 'notification_created':            
            koaIO.to(notification.user.uid).emit(action)            
            break
        case 'notification_updated':
            koaIO.to(actor.uid).emit(action)            
            break
    }
})

export default function (app) {
    app.keys = ['weavy-secret']

    app.use(session({}, app))
    app.use(koaBody())

    koaIO = new koaSocketIO()
    koaIO.attach(app)

    koaIO.on('join', async (ctx, userId) => {        
        //console.log(userId, " is connected!")
        ctx.socket.join(userId)
    })

    initDatabase();

    app.use(
        userAuth({
            userField: 'uid',
            //match: /^(?!\/login|public)/,
            ignore: /^\/login|public|webhooks/,
            loginPath: '/login',
            loginCallbackPath: '/login/callback',
            logoutPath: '/logout',
            // auth system login url
            loginURLFormatter: function (_url, _rootPath, _ctx) {
                return '/login.html'
            },
            // login callback and getUser info handler
            getUser: async (ctx) => {
                const username = ctx.request.body?.username
                const password = ctx.request.body?.password

                // validate user
                const validUser = await getUser(username) // validate user...
                
                const validPassword = password === validUser?.pass;

                if (validUser && validPassword) {
                    return validUser
                } else if(username) {
                    console.warn("User not valid")
                    return new Error("User not valid")
                }
            },
            loginCallback: async (ctx, user) => {
                const username = ctx.request.body?.username

                if (user && !(user instanceof Error)) {
                    const uid = await getUid(user.username)

                    // TODO: object compare instead?
                    if (user !== ctx.session.user) {                        
                        try {
                            ctx.session.user = user;

                            await syncUser({
                                uid,
                                name: user.name,
                                picture: user.avatar,
                                directory: 'ACME',
                            })                            
                        } catch(e) {
                            console.log("Error syncing user without email and username", e.cause.status)
                            return [undefined]
                        }

                        
                    }

                    return [uid]
                } else if(user instanceof Error || username) {
                    console.log("Redirecting to login")
                    return [undefined, "/login.html?error&username=" + encodeURIComponent(username)]
                }
            },
            loginCheck: (ctx) => { return Boolean(ctx.session.uid) && !ctx.session.isNew },
            logoutCallback: async (ctx) => {
                ctx.status = 303
                ctx.session.user = undefined
                return '/?cache=' + Date.now()
            },
        })
    )
    return router.routes()
}
