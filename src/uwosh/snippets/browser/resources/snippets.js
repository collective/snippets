(function() {
  tinymce.create('tinymce.plugins.SnippetsPlugin', {
    init : function(ed, url) {

      tinymce.DOM.loadCSS(url + '/snippets.css');

      ed.addCommand('snippets', function(ui) {

        options = {
          current_url: url,
        };

        openSnippetWindow(options);
      });

      ed.addButton('snippetbutton', {
        title : 'Add Snippet.',
        cmd : 'snippets',
      });

      ed.onClick.add(function(ed, e) {
          if( $(e.target).parents('span[data-type="snippet_tag"]').length > 0 || $(e.target).attr('data-type') == 'snippet_tag')
          {
            if( $(e.target).attr('data-type') == 'snippet_tag' )
            {
              snippet_element = e.target;
            }
            else
            {
              snippet_element = $(e.target).parents('span[data-type="snippet_tag"]');
            }

            options = {
              current_url: url,
              editor_snippet: snippet_element,
            };

            openSnippetWindow(options);
          }
      });

      ed.onSetContent.add(function(ed, e) {
        var snippets = $(ed.contentDocument).find('span[data-type="snippet_tag"]');

        //We just want to get each snippet once, if there are duplicates, just ignore them
        snippet_ids = [];
        $(snippets).each(function(index, item) {
          if( $.inArray($(item).attr('data-snippet-id'), snippet_ids) == -1 )
          {
            snippet_ids.push($(item).attr('data-snippet-id'));
          }
        });

        if( snippet_ids.length > 0 )
        {

          var edit_url = document.baseURI + '/@@get-snippet-list?json=true&snippet_id=';
          

          var ids = [];
          $(snippet_ids).each(function(index, item) {
            ids.push(item);
          });

          var idList = ids.join();

          edit_url += idList;
          $.ajax({
            url: edit_url,
            dataType: 'json',
            success: function(data) {

              $(data).each(function() {

                var snippet = $(tinyMCE.activeEditor.contentDocument).find('span[data-snippet-id="' + this.id + '"]');

                var self = this;

                if( self.dead == true )
                {
                  var text = '<span data-type="dead_snippet"></span>'
                  $(snippet).each(function()
                  {
                    $(this).html(text);
                    $(this).css('display', 'none');
                  });
                }
                else
                {
                  var text = self.text;
                  $(snippet).each(function() {
                    $(this).html(text);
                    $(this).css('outline', 'black dotted thin');
                    $(this).css('display', 'inline-block');
                    $(this).addClass('no-select');
                    $(this).attr('contenteditable', 'false');
                  });
                }
              });
            },
            error: function(xhr) {
              console.log(xhr);
            },
          });

        }


      });
      ed.onPostProcess.add(function(ed, o) {
        var body = o.node;
        $(body).find('span[data-type="dead_snippet"]').parent().remove();
        var snippets = $(body).find('span[data-type="snippet_tag"]');

        $(snippets).html("").removeAttr('contenteditable');


        o.content = $(body).html();
      });
      //Prevents TinyMCE from wrapping text in <p> tags.
      //Since these are meant to be used in-line,
      //breaking to a new paragraph obviously isn't desired.
      var pageUrl = String(document.URL);
      if( pageUrl.indexOf('@@edit-snippet') >= 0 || pageUrl.indexOf('@@create-snippet') >= 0)
      {
        ed.settings.force_p_newlines = 0;
        ed.settings.forced_root_block = false;
        ed.settings.relative_urls = false;
        ed.settings.remove_script_host = true;
      }

      function openSnippetWindow(options)
      {
        ed.windowManager.open({
          file: url + '/@@get-snippet-list',
          width: 800,
          height: 700,
          inline: 1,
        }, options);
      }
    },
  });
  tinymce.PluginManager.add('snippets', tinymce.plugins.SnippetsPlugin);
})();
