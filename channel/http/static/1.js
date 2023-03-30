
function ConvState(wrapper, form, params) {
    this.id='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    this.form = form;
    this.wrapper = wrapper;
    this.parameters = params;
    this.scrollDown = function () {
        $(this.wrapper).find('#messages').stop().animate({ scrollTop: $(this.wrapper).find('#messages')[0].scrollHeight }, 600);
    }.bind(this);
};
ConvState.prototype.printAnswer = function (answer = '输入 画xx 可以为你画一张图片。我无法对事实性与实时性问题提供准确答复，请慎重对待回答。') {
    setTimeout(function () {
        var messageObj = $(this.wrapper).find('.message.typing');
        answer = marked.parse(answer);
        messageObj.html(answer);
        messageObj.removeClass('typing').addClass('ready');
        this.scrollDown();
        $(this.wrapper).find("#userInput").focus();
    }.bind(this), 500);
};
ConvState.prototype.sendMessage = function (msg) {
    var message = $('<div class="message right" ><p>' + msg + '</p></div>');

    $('button.submit').removeClass('glow');
    $(this.wrapper).find("#userInput").focus();
    setTimeout(function () {
        $(this.wrapper).find("#messages").append(message);
        this.scrollDown();
    }.bind(this), 100);

    var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
    setTimeout(function () {
        $(this.wrapper).find('#messages').append(messageObj);
        this.scrollDown();
    }.bind(this), 150);
    var _this = this
    $.ajax({
        url: "./chat",
        type: "POST",
        timeout:180000,
        data: JSON.stringify({
            "id": _this.id,
            "msg": msg
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            _this.printAnswer(data.result)
        },
        error:function () {
            _this.printAnswer("网络故障，对话未送达")
        },
    })
};
(function ($) {
    $.fn.convform = function () {
        var wrapper = this;
        $(this).addClass('conv-form-wrapper');

        var parameters = $.extend(true, {}, {
            // placeHolder: '在这里输入内容',
            // typeInputUi: 'textarea',
            formIdName: 'convForm',
            inputIdName: 'userInput',
            // buttonText: '发送'
        });

        //hides original form so users cant interact with it
        var form = $(wrapper).find('form').hide();

        var inputForm;
        // parameters.inputIdHashTagName = '#userInput';
        inputForm = $('<div id="' + parameters.formIdName + '" class="convFormDynamic"><div class="options dragscroll"></div><span class="clear"></span></form>');

        //appends messages wrapper and newly created form with the spinner load
        $(wrapper).append('<div class="wrapper-messages"><div class="spinLoader"></div><div id="messages"></div></div>');
        $(wrapper).append(inputForm);

        var state = new ConvState(wrapper, form, parameters);

        //prints first contact
        $.when($('div.spinLoader').addClass('hidden')).done(function () {
            var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
            $(state.wrapper).find('#messages').append(messageObj);
            state.scrollDown();
            state.printAnswer();
        });

        //binds enter to send message
        $(document).on('keypress', '#userInput', function(e) {
            if (e.which == 13) {
              var input = $(this).val();
              e.preventDefault();
              if (input.trim() != '' && !$('#userInput').hasClass("error")) {
                $('#userInput').val("");
                state.sendMessage(input);
              } else {
                $('#userInput').focus();
              }
            }
            // 自动调整输入框大小以适应文本
            autosize.update($('#userInput'));
          });
          
          // 输入时检查是否有文本
          $(document).on('input', '#userInput', function(e) {
            if ($(this).val().length > 0) {
              $('button.submit').addClass('glow');
            } else {
              $('button.submit').removeClass('glow');
            }
          });
          
          // 点击发送按钮发送消息
          $(document).on('click', 'button.submit', function(e) {
            var input = $('#userInput').val();
            e.preventDefault();
            if (input.trim() != '' && !$('#userInput').hasClass("error")) {
              $('#userInput').val("");
              state.sendMessage(input);
            } else {
              $('#userInput').focus();
            }
            autosize.update($('#userInput'));
          });
          
          // 如果存在autosize，则自动调整输入框大小
          if (typeof autosize == 'function') {
            $textarea = $('#userInput');
            autosize($textarea);
          }

        return state;
    }
})(jQuery);
