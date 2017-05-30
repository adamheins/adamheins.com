I use the vim plugin [Ctrl-P](https://github.com/ctrlpvim/ctrlp.vim). Ctrl-P is
a convenient file search plugin, which allows regex searching for files in the
directory tree.

I also use [fzf](https://github.com/junegunn/fzf), which provides similar file
search functionality, but for the terminal. fzf also has a vim plugin, which I
assume is similar to Ctrl-P, though I haven't used it. By default, the file
search mode of fzf is bound to the key binding `ctrl-t`.

In my opinion, fzf's file search is missing one key feature. When you select the
file or directory path from the search window, it is simply pasted into the
terminal. This is useful for some applications, but most of the time I either
want to edit the file (if the selected path points to a file) or change to the
directory (if the path points to a directory).

Luckily, fzf is very extensible. I use zsh as my shell, so I wrote my own
[ZLE widget](http://zsh.sourceforge.net/Doc/Release/Zsh-Line-Editor.html#Zle-Widgets)
to implement the feature. The code for the widget is below.

```zsh
# This is the same functionality as fzf's ctrl-t, except that the file or
# directory selected is now automatically cd'ed or opened, respectively.
fzf-open-file-or-dir() {
  local cmd="command find -L . \
    \\( -path '*/\\.*' -o -fstype 'dev' -o -fstype 'proc' \\) -prune \
    -o -type f -print \
    -o -type d -print \
    -o -type l -print 2> /dev/null | sed 1d | cut -b3-"
  local out=$(eval $cmd | fzf-tmux --exit-0)

  if [ -f "$out" ]; then
    $EDITOR "$out" < /dev/tty
  elif [ -d "$out" ]; then
    cd "$out"
    zle reset-prompt
  fi
}
zle     -N   fzf-open-file-or-dir
bindkey '^P' fzf-open-file-or-dir
```

The lines containing the assignments to `cmd` and `out` are adapted from fzf's
built-in file search widget. The `if` statement that follows implements the new
behaviour.

One of the interesting parts of the new code is the line
`$EDITOR "$out" </dev/tty`. It opens the selected file with your `$EDITOR`. The
redirection of input from `/dev/tty` is required for my `$EDITOR`, vim, to
properly read input from the terminal, since it's being called
non-interactively. On Linux systems, `/dev/tty` is an alias for "the
controlling terminal of the current process" (see the [man
page](http://linux.die.net/man/4/tty)). I've only tried this with vim; your
results with other editors may vary.

Another interesting piece of code is the line `zle reset-prompt`. This command
simply does what it says: it resets the user's prompt after we've cd'ed.

I assigned the widget to the key binding `ctrl-p`, so now I can use that same
binding for the same purpose in both vim and the terminal.
