import { MobileServiceClient } from "nativescript-azure-mobile-apps/client";
import { MobileServiceTable } from "nativescript-azure-mobile-apps/table";
import { AuthenticationProvider } from "nativescript-azure-mobile-apps/user";
import dialogs = require("ui/dialogs");
import { ActivityIndicator } from "ui/activity-indicator";
import { Page } from "ui/page";
import { EventData } from "data/observable";

let client: MobileServiceClient;
let todoItemTable: MobileServiceTable;
let item: TodoItem;
let ai: ActivityIndicator;

class TodoItem {
    public id: string;
    public text: string
    public completed: boolean;
}

export function onNavigatingTo(args: EventData) {
    client = new MobileServiceClient("https://<YOUR PORTAL>.azurewebsites.net");
    todoItemTable = client.getTable("TodoItem");
    ai = (<Page>args.object).getViewById<ActivityIndicator>("ai");
}

export function onAddItemTap(args) {
    ai.busy = true;
    
    item = new TodoItem();
    item.text = "NativeScript Rocks";
    item.completed = false;
    
    todoItemTable.insert(item).then((updatedItem) => {
        ai.busy = false;
        
        item = updatedItem;
        dialogs.alert("Item added!")
    }, (e) => {
        ai.busy = false;
        
        console.log("Error adding item!", e);
    });
}

export function onUpdateItemTap(args) {
    if (!item) {
        dialogs.alert("There is no item. Use Add first!");
        return;
    }
    
    ai.busy = true;
    
    item.completed = true;
    
    todoItemTable.update(item).then((updatedItem) => {
        ai.busy = false;

        item = updatedItem;
        dialogs.alert("Item update successfully!");
    }, (e) => {
        ai.busy = false;

        console.log("Error updating item!", e);
    });
}

export function onGetAllItemsTap(args) {
    ai.busy = true;
    
    todoItemTable.read().then((results) => {
        ai.busy = false;

        dialogs.alert(`There are total ${results.length} items`);
    }, (e) => {
        ai.busy = false;

        console.log("Error getting incomplete items!", e);
    });
}

export function onGetCompletedItemsTap(args) {
    ai.busy = true;
    
    todoItemTable.where().field("completed").eq(true).read().then((results) => {
        ai.busy = false;

        dialogs.alert(`There are ${results.length} completed items`);
    }, (e) => {
        ai.busy = false;

        console.log("Error getting incomplete items!", e);
    });
}

export function onDeleteItemTap(args) {
    if (!item) {
        dialogs.alert("There is no item. Use Add first!");
        return;
    }
    
    ai.busy = true;
    
    todoItemTable.deleteItem(item).then(() => {
        ai.busy = false;

        dialogs.alert("Item deleted successfully!");
        item = null;
    }, (e) => {
        ai.busy = false;

        console.log("Error deleting item!", e);
    });
}

export function onLoginTap(args) {
    ai.busy = true;
    
    if (client.loginFromCache()) {
        console.log(`Logged in via cached credentials! UserID: ${client.user.userId}`);
        
        ai.busy = false;
    }
    else {
        client.login(AuthenticationProvider.Google).then((user) => {           
            console.log(`Logged In! UserID: ${user.userId}`);
            
            user.getProviderCredentials().then((result) => {
                console.log(`Surname: ${result.surname}`);
                console.log(`Given Name: ${result.givenName}`);
                console.log(`Name: ${result.name}`);
            
                ai.busy = false;
            });
        }, (e) => {
            ai.busy = false;

            console.log("Error Logging in!", e);
        });
    }
}