process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

if (!process.env.WEAVY_URL) {
    throw new Error('No WEAVY_URL defined in .env')
}

const weavyUrl = new URL(process.env.WEAVY_URL)

if (!process.env.WEAVY_APIKEY) {
    throw new Error('No WEAVY_APIKEY defined in .env')
}

const apiKey = process.env.WEAVY_APIKEY

const tokens = new Map()

export const syncUser = async (user) => {
    
    const response = await fetch(new URL(`/api/users/${user.uid}`, weavyUrl), {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(user),
    })

    if (!response.ok) {
        throw new Error('Error fetching user', { cause: response })
    }

    return await response.json()
}

export const initApp = async ({ uid, name, type, userId }) => {
    if (type !== 'messenger') {
        const app = { uid: uid, name: name, type: type }
        const user = { uid: `${userId}` }

        const response = await fetch(new URL(`/api/apps/init`, weavyUrl), {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ app: app, user: user }),
        })

        if (!response.ok) {
            throw new Error('Error fetching app', { cause: response })
        }

        return await response.json()
    }
}

export const getUserToken = async ({ uid, refresh = false }) => {
    
    if (!refresh && tokens.has(uid)) {
        return {
            access_token: tokens.get(uid),
        }
    } else {
        let response = await fetch(new URL(`/api/users/${uid}/tokens`, weavyUrl), {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ name: uid, expires_in: 3600 }),
        })

        if (!response.ok) {
            throw new Error('Error fetching token', { cause: response })
        }

        let data = await response.json()
        tokens.set(uid, data.access_token)

        return data
    }
}

export const sendMessage = async ({ id, text }) => {
        
    // send message pn behalf of the system api token
    const messagesUrl = new URL(`/api/apps/${id}/messages`, weavyUrl)

    const response = await fetch(
        messagesUrl,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                text: text
            })
        }
    )
        
    if (!response.ok) {
        throw new Error('Could not send message with api!', { cause: response })
    }

    return await response.json();
}

export const getNotifications = async ({ access_token, count_only, unread }) => {
    // get Weavy notifications on behalf of user
    const notificationsUrl = new URL(
        `/api/notifications?order_by=id+desc${
            unread && unread !== 'false' ? '&unread=true' : ''
        }${
            count_only && count_only !== 'false' ? '&count_only=true' : ''
        }`,
        weavyUrl
    )

    const response = await fetch(
        notificationsUrl,
        {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Could not get notifications from Weavy!', { cause: response })
    }

    return await response.json()
}

export const markNotifications = async ({ access_token }) => {
    // mark notifications as read on behalf of user
    const notificationsUrl = new URL(`/api/notifications/mark`, weavyUrl)

    const response = await fetch(
        notificationsUrl,
        {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
        
    if (!response.ok) {
        throw new Error('Could not mark notifications as read!', { cause: response })
    }

    return await response
}

export const readNotification = async ({ id, access_token }) => {
    // mark notifications as read on behalf of user
    const notificationsUrl = new URL(`/api/notifications/${id}/mark`, weavyUrl)

    const response = await fetch(
        notificationsUrl,
        {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
        
    if (!response.ok) {
        throw new Error('Could not mark single notification as read!', { cause: response })
    }

    return await response
}

export const unreadNotification = async ({ id, access_token }) => {
    // mark notifications as unread on behalf of user
    const notificationsUrl = new URL(`/api/notifications/${id}/mark`, weavyUrl)

    const response = await fetch(
        notificationsUrl,
        {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        }
    )
        
    if (!response.ok) {
        throw new Error('Could not mark single notification as unread!', { cause: response })
    }

    return await response
}

