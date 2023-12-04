import { JsonDB, Config } from 'node-json-db';

const db = new JsonDB(new Config("db", true, true, '/'));

export const initDb = async () => {
    let users = null;
    try {
        users = await db.getData("/users");
    } catch(error){        
        await db.push("/users",[]);

        await db.push("/users[]", { name: 'Marvin Acme', username: 'admin', pass: 'acme', email: 'marvin@acme.corp', is_admin: true});
        await db.push("/users[]", { name: 'Road Runner', username: 'meepmeep', pass: 'acme', email: 'roadrunner@acme.corp', avatar: 'https://i.pravatar.cc/150?u=meepmeep'});
        await db.push("/users[]", { name: 'Bugs Bunny', username: 'bugs', pass: 'acme', email: 'bugs@acme.corp', avatar: 'https://i.pravatar.cc/150?u=bugs'});
        await db.push("/users[]", { name: 'Daffy Duck', username: 'daffy', pass: 'acme', email: 'daffy@acme.corp', avatar: 'https://i.pravatar.cc/150?u=daffy'});
        await db.push("/users[]", { name: 'Porky Pig', username: 'porky', pass: 'acme', email: 'porky@acme.corp', avatar: 'https://i.pravatar.cc/150?u=porky'});
        await db.push("/users[]", { name: 'Tweety Bird', username: 'tweety', pass: 'acme', email: 'tweety@acme.corp', avatar: 'https://i.pravatar.cc/150?u=tweety'});
        await db.push("/users[]", { name: 'Wile E. Coyote', username: 'wile', pass: 'acme', email: 'wile@acme.corp', avatar: 'https://i.pravatar.cc/150?u=wile'});

        users = await db.getData("/users");
    }    

    return users;
}

export const getUser = async (username) => {
    const index = await db.getIndex("/users", username, "username");
    if(index !== -1){
        return await db.getData("/users[" + index + "]");
    }    
}

export const getUsers = async () => {
    return await db.getData("/users");        
}

export const updateUser = async (username, data) => {    
    const index = await db.getIndex("/users", username, "username");
    await db.push("/users[" + index + "]", data);
}