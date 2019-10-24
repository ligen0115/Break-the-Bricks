
(function (w) {
    var Tool = {
        getRandomColor: function () {
            return 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')'
        }
    }
    w.Tool = Tool;
})(window);

(function (w) {
    function Pole(optional) {
        optional = optional || {};
        this.width = optional.width || 150;
        this.color = optional.color || 'rgb(247, 238, 238)';
        this.top = optional.top || 770;
        this.left = optional.left || 500;
        this.map = optional.map;
    }

    Pole.prototype.render = function () {
        this.pole = $('<div></div>').css({
            'position': 'absolute',
            'width': this.width,
            'height': 20,
            'background': this.color,
            'borderRadius': 5,
            'top': this.top,
            'left': this.left,
        }).appendTo(this.map)
    };

    Pole.prototype.move = function () {
        $(document).on('mousemove', function (e) {
            var mapWidth = parseInt($(this.map).css('width'));
            var poleWidth = parseInt($(this.pole).css('width'));
            if (e.pageX - poleWidth / 2 > $(this.map).offset().left && e.pageX + poleWidth / 2 < $(this.map).offset().left + parseInt($(this.map).css('width'))) {
                $(this.pole).offset({ 'left': e.pageX - poleWidth / 2 })
            };
            if (e.pageX < $(this.pole).offset().left) {
                $(this.pole).offset({ 'left': $(this.map).offset().left })
            };
            if (e.pageX > $(this.map).offset().left + mapWidth) {
                $(this.pole).offset({ 'left': $(this.map).offset().left + mapWidth - poleWidth })
            };
        }.bind(this))
    };

    w.Pole = Pole;
})(window);


(function (w) {
    function Ball(optional) {
        optional = optional || {};
        this.width = optional.width || 20;
        this.height = optional.height || 20;
        this.color = optional.color || Tool.getRandomColor();
        this.top = optional.top || 750;
        this.left = optional.left || 575;
        this.map = optional.map;
    }

    Ball.prototype.render = function () {
        return this.ball = $('<div></div>').css({
            'position': 'absolute',
            'width': this.width,
            'height': this.height,
            'background': this.color,
            'borderRadius': this.height / 2,
            'top': this.top,
            'left': this.left,
            'border': '1px solid rgb(255, 255, 255)'
        }).appendTo(this.map)
    };

    w.Ball = Ball;
})(window);

(function (w) {
    function Chunk(optional) {
        optional = optional || {};
        this.width = optional.width || 150;
        this.height = optional.height || 40;
        this.color = optional.color;
        this.borderColor1 = optional.borderColor || 'rgb(10, 114, 139) '
        this.borderColor2 = optional.borderColor || 'rgb(19, 100, 100) '
        this.top = optional.top || 100;
        this.left = optional.left || 150;
        this.chunkArr = [];
        this.map = optional.map;
    }

    Chunk.prototype.render = function (row) {
        row = row || 1;
        if (this.chunkArr.length != 0) {
            for (var i = 0; i < this.chunkArr.length; i++) {
                $(this.chunkArr[i]).offset({ 'top': $(this.chunkArr[i]).offset().top + (this.chunkArr[i].offsetHeight + 10) * row })
            };
        }
        for (var j = 0; j < row; j++) {
            this.color = Tool.getRandomColor();
            for (var i = 1; i <= 6; i++) {
                this.chunk = $('<p class="chunk"></p>').css({
                    'position': 'absolute',
                    'width': this.width,
                    'height': this.height,
                    'background': this.color,
                    'top': this.top + j * (this.height + 10),
                    'left': this.left * i,
                    'border': '5px solid',
                    'borderColor': i % 2 == 0 ? this.borderColor1 + this.borderColor2 : this.borderColor2 + this.borderColor1,
                    'transition': 'all .5s'
                }).appendTo(this.map)
                this.chunkArr.push(this.chunk[0]);
            };
        };
    };

    w.Chunk = Chunk;
})(window);

(function (w) {
    function Game(optional) {
        this.map = optional.map;
        this.pole = new Pole({ map: this.map });
        this.ball = new Ball({ map: this.map });
        this.chunk = new Chunk({ map: this.map });
        this.score = $('<div id="score">0</div>').appendTo('body');
    }

    Game.prototype.begin = function () {
        this.pole.render();
        this.pole.move();
        this.chunk.render(5);
        this.moveCrash(this.pole.pole, this.chunk.chunkArr, this.ball.render());
        this.addChunk();
    };

    Game.prototype.addChunk = function () {
        this.map.addTime = setInterval(function () {
            this.chunk.render()
        }.bind(this), 7000);
    };

    Game.prototype.moveCrash = function (pole, chunkArr, ball) {
        var stepX = Math.random() > 0.5 ? 2.5 : -2.5;
        var stepY = -2.5;
        clearInterval(this.moveTime);
        this.moveTime = setInterval(function () {
            var targetLeft = $(ball).offset().left + stepX;
            var targetTop = $(ball).offset().top + stepY;
            $(ball).offset({
                'left': targetLeft,
                'top': targetTop
            });
            if (targetLeft <= $('#map').offset().left) {
                stepX = Math.abs(stepX);
            } else if (targetTop <= $('#map').offset().top) {
                stepY = Math.abs(stepY);
            } else if (targetLeft >= $('#map').offset().left + $('#map')[0].offsetWidth - $(ball)[0].offsetWidth) {
                stepX = -Math.abs(stepX);
            } else if (targetTop >= this.ball.top && targetTop <= this.ball.top + 10 && targetLeft >= $(pole).offset().left - $(ball)[0].offsetWidth && targetLeft <= $(pole).offset().left + $(pole)[0].offsetWidth) {
                stepY = -Math.abs(stepY);
                $(ball).css({ 'background': Tool.getRandomColor() });
                if (targetLeft >= $(pole).offset().left + ($(pole)[0].offsetWidth - ($(pole)[0].offsetWidth / 3))) {
                    stepX += 0.3
                } else if (targetLeft >= $(pole).offset().left + ($(pole)[0].offsetWidth - $(pole)[0].offsetWidth / 3 * 2)) {
                } else {
                    stepX -= 0.3
                }
            } else if (targetTop > $('#map')[0].offsetHeight) {
                $(ball).remove();
                this.chunk.render(3)
                setTimeout(function () {
                    ball = this.ball.render().css({ 'left': $(pole)[0].offsetLeft + 75 });
                    stepX = Math.random() > 0.5 ? 2.5 : -2.5;
                    stepY = -2.5;
                }.bind(this), 1000);
                return;
            }
            for (var i = 0; i < chunkArr.length; i++) {
                var crashTop = $(chunkArr[i]).offset().top - $(ball)[0].offsetHeight;
                var crashBottom = $(chunkArr[i]).offset().top + chunkArr[i].offsetHeight;
                var crashLeft = $(chunkArr[i]).offset().left - $(ball)[0].offsetWidth;
                var crashRigth = $(chunkArr[i]).offset().left + chunkArr[i].offsetWidth;
                if (crashBottom > 750) {
                    clearInterval(this.map.addTime);
                    clearInterval(this.moveTime);
                    alert('游戏失败');
                    location.reload();
                    return;
                }
                if (targetTop >= crashTop && targetTop <= crashBottom && targetLeft > crashLeft && targetLeft < crashRigth) {
                    if (targetTop - crashTop == 0 || (targetTop - crashTop <= 60 && targetTop - crashTop > 55 && targetLeft - crashLeft > 2 && targetLeft - crashLeft < 167)) {
                        stepY = stepY > 0 ? -stepY : Math.abs(stepY);
                    } else {
                        stepX = stepX > 0 ? -stepX : Math.abs(stepX);
                    }
                    $(chunkArr[i]).remove();
                    chunkArr.splice(i, 1);
                    $(this.score).text(parseInt($(this.score).text()) + 1)
                    $(ball).css({ 'background': Tool.getRandomColor() });
                    return;
                }
            };
        }.bind(this), 5);
    };

    w.Game = Game;
})(window);

(function (w) {
    var game = new Game({ map: $('#map') });
    game.begin();
})(window);


