class User {
    constructor() {
        this.KEY = "FRECH19";
        this.User = {};
        this.loadUser();
    }


    getValue(Key) {
      if(! this.User) return;
      if(! this.User.CurrentUserID) return;
      if(! this.User[this.User.CurrentUserID]) return;
      return this.User[this.User.CurrentUserID][Key];
    }

    setValue(Key, Value) {
        //console.log("setvalue", Key, Value, this.User, this.User.CurrentUserID);
        this.User[this.User.CurrentUserID][Key] = Value;
        this.saveUser();
    }

    get ID() {
        return this.User.CurrentUserID;
    }

    loadUser() {
        var UserTXT = localStorage.getItem(this.KEY);
        if (!UserTXT) UserTXT = '{}';
        this.User = JSON.parse(UserTXT);
        //console.log("loadUser", this.User);
    }

    saveUser() {
        //console.log("saveUser", this.User);
        localStorage.setItem(this.KEY, JSON.stringify(this.User));
    }

    loadImages() {
        var HTML = "";
        IMG.forEach(function (item) {
            HTML += "<div class='col-4'><img src='/img/" + item + "' data-img='" + item + "' class='img-fluid m-3' onClick='fave(this)'></div>";
        });
        $("#imgall").html(HTML);
        var Favs = this.getFavs();
        for (var k = 1; k < 5; k++) {
            if (Favs[k]) {
                $("#fav" + k).attr("src", "/img/" + Favs[k]);
            } else {
                $("#fav" + k).attr("src", "/img/empty.jpg");
            }
        }
        $("#username").text(this.getValue('DisplayName'));
    }

    unsetFav(Nr) {
        var Favs = this.getFavs();
        Favs[Nr] = null;
        this.setValue('Favs', Favs);
        this.saveUser();
        this.loadImages();
    }

    setFav(FileName) {
        var Favs = this.getFavs();
        var isAlreadyIn = false;
        var k;
        for (k = 1; k < 5; k++) {
            if (Favs[k] == FileName) isAlreadyIn = true;
        }
        for (k = 1; k < 5; k++) {
            if (!Favs[k]) {
                if (!isAlreadyIn) {
                    Favs[k] = FileName;
                    isAlreadyIn = true;
                }
            }
        }
        this.setValue('Favs', Favs);
        this.saveUser();
        this.loadImages();
    }


    getFavs() {
        var Favs = this.getValue('Favs');
        if (!Favs) Favs = [null, null, null, null, null];
        return Favs;
    }

    getFavCount() {
        var Favs = this.getFavs();
        var FavCount = 0;
        for (var k = 1; k < 5; k++) {
            if (Favs[k]) FavCount++;
        }
        return FavCount;
    }

    insideSession() {
        var Now = +new Date;
        var LastSaved = this.getValue('lastSaved');
        if(! LastSaved) LastSaved =0;
        var Delta = Now -LastSaved;
        console.log("insideSession", Now, LastSaved,Delta, this.ID);
        if (!this.ID) return false;
        return true;
    }

    storePara() {
        var Para = new URLSearchParams(window.location.search);
        var UserID = Para.get("uid");
        if (!UserID) return false;
        var UserName = Para.get("un");
        var DisplayName = Para.get("dn");
        var Hash = Para.get("h");
        var ThisHash = md5(UserID + UserName + DisplayName + ":2019");
        console.log("Hash", Hash, ThisHash);
        if(ThisHash !== Hash) return false;

        this.User.CurrentUserID = UserID;
        this.User[UserID] = this.User[UserID] || {};
        this.setValue('UserID', UserID);
        this.setValue('UserName', UserName);
        this.setValue('DisplayName', DisplayName);
        this.setValue('lastSaved', +new Date);
        this.saveUser();
        return true;
    }


    sendVote() {
        var Favs = this.getFavs();
        for (var k = 1; k < 5; k++) {
            ga('send', 'event', "fav", this.ID, Favs[k], 1);
        }
        $.each(this.User, function (key, value) {
          if(key != "CurrentUserID")  ga('send', 'event', "user", this.ID, key, 1);
        });
        Favs = [null, null, null, null, null];
        this.setValue('Favs', Favs);
        this.saveUser();
        this.loadImages();

    }

}

function submitVote() {
    var FavCount = ThisUSER.getFavCount();
    if (FavCount != 4) {
        $("#textdanger").text("You have " + FavCount + " favs, please submit when you have 4 favs.");
        $("#textsuccess").text("");
        return;
    }
    $("#textdanger").text("");
    $("#textsuccess").text("Your vote was submitted");
    ThisUSER.sendVote();
}

function loadPage() {
    if (hasLocalStorage()) {
        if (ThisUSER.storePara()) {
            // we had good data
            window.location.replace("/");
        } else if (ThisUSER.insideSession()) {
            ThisUSER.loadImages();
        } else {
            showError("Only open the page from the Box at Davos Voting Skybox (Hash)");
        }
    } else {
        showError("Browser to old");
    }
    // 'https://frech-hinterland.github.io/?uid=87e99b8a%2Dc81f%2D4a3f%2D9727%2D1e7d3ccbed55&un=frech%2Ehinterland&dn=Frech%20Hinterland&h=18bd8cd8e74c004160718f02e799db22'
}

function fave(obj) {
    var Filename = $(obj).data("img");
    ThisUSER.setFav(Filename);
}

function deFav(Nr) {
    ThisUSER.unsetFav(Nr);
}

function showError(Error) {
    $("#imgarea").html("<h3>" + Error + "</h3>");
    $("#toptext").html('');
    console.log("error", Error);
}

function hasLocalStorage() {
    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem('feature_test', 'yes');
            if (localStorage.getItem('feature_test') === 'yes') {
                localStorage.removeItem('feature_test');
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

$(function () {
    ThisUSER = new User();
    loadPage();
});

/*
    setArrayValue(Key, Index, Value) {
        this.User[this.User.CurrentUserID][Key][Index] = Value;
        this.saveUser();
    }
    getArrayValue(Key,Index) {
        return this.User[this.User.CurrentUserID][Key][Index] = Value;
    }

    function getValue(Key) {
    var User = getUser();
    console.log("get", User);
    return User[Key];
}

function setValue2(Key1, Key2, Value) {
    var User = getUser();
    User[Key1][Key2] = Value;
    setUser(User);
}

function setValue(Key, Value) {
    var User = getUser();
    User[Key] = Value;
    setUser(User);
}

function getUser() {
    var UserTXT = localStorage.getItem(getKey());
    if (!UserTXT) UserTXT = "{}";
    return JSON.parse(UserTXT);
}

function setUser(User) {
    localStorage.setItem(getKey(), JSON.stringify(User));
}

function fave(obj) {
    var Filename = $(obj).data("img");
    var Favs = getValue('Favs');
    console.log("load favs", Favs);
    if (!Favs) Favs = [null, null, null, null, null];
    var alreadyFaved = false;
    for (var k = 1; k < 5; k++) {
        if (!Favs[k]) {
            if (!alreadyFaved) {
                Favs[k] = Filename;
                setValue('Favs', Favs);
                alreadyFaved = true;
            }
        } else {
            if (Favs[k] == Filename) alreadyFaved = true;
        }
    }
    loadAllImages();
}

function deFav(obj) {
    setValue2("Favs", 1, null);
    console.log("deFav", obj, getValue('Favs'));
    loadAllImages();
}

function moveImage(ImageName, Direction) {

}

function loadAllImages() {
    var HTML = "";
    IMG.forEach(function (item) {
        HTML += "<div class='col-4'><img src='/img/" + item + "' data-img='" + item + "' class='img-fluid m-3' onClick='fave(this)'></div>";
    });
    $("#imgall").html(HTML);
    var Favs = getValue('Favs');
    for (k = 1; k < 5; k++) {
        if (Favs[k]) {
            $("#fav" + k).attr("src", "/img/" + Favs[k]);
        } else {
            $("#fav" + k).attr("src", "/img/empty.jpg");
        }
    }
}

function getKey() {
    return "FRECH19";
}


    */
