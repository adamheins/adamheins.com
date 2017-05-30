In this post I'm going to be discussing a few common tasks having to do with
string reversal. First, I'm going to look at a simple algorithm for determining
whether or not a string is a
[palindrome](https://en.wikipedia.org/wiki/Palindrome). Next, I'm going to
build on this idea to efficiently reverse the characters in a string. Finally,
I will discuss how to do this to each string in a sequence of strings.

To start, let's take a look a palindromes. A palindrome is a sequence of
characters that reads the same forward and backward. A common example of a
palindrome is the word "racecar", which is still "racecar" if spelled backward.
So how can we make a computer identify if a string is a palindrome? Well, we
want to determine if the string is the same spelled backward as it is forward.
That means that the last character in the string must be the same as the first
character in the string. The second character must also be the same as the
second last character. And so on.

We can write this quite easily in code. Here is a Java function that determines
if a string is a palindrome. It has a runtime complexity of \\(O(\frac n2)\\)
and an auxillary space complexity of \\(O(1)\\). I'm specifying that the
algorithm has a runtime complexity of \\(O(\frac n2)\\) to differentiate it
from less efficient solutions that have a runtime complexity of \\(O(1)\\).

```java
public static boolean isPalindrome(String sequence) {
    int n = sequence.length();

    // Compare the ith character to the ith-from-the-end character.
    for (int i = 0; i < n / 2; i++) {
        if (sequence.charAt(i) != sequence.charAt(n - 1 - i))
            return false;
    }
    return true;
}
```

Pretty easy, right? Now how can we modify this function to instead reverse the
characters in a string? Instead of comparing characters from the front of the
string to characters at the back of the string, we will swap characters from
the front with those at the back. We can create a new function that looks quite
similar to the old one. However, in this function, we're going to use arrays of
characters instead of strings, since Java String objects are immutable and we
want this algorithm to directly modify the character sequence so it can run
in-place. This function has the same runtime and space complexity as the
`isPalindrome` function above.

```java
public static void reverseCharArray(char [] sequence) {
    int n = sequence.length;

    // Swap the ith character with the ith-from-the-end character.
    for (int i = 0; i < n / 2; i++) {
        char temp = sequence[i];
        sequence[i] = sequence[n - 1 - i];
        sequence[n - 1 - i] = temp;
    }
}
```

The problem gets a little more interesting when we want to reverse the
characters in every word in a phrase. For example, "I love to code" would
become "I evol ot edoc". The words are in the same positions, but the
characters are reversed in each. We're going to continue to use char arrays
instead of String objects. First, let's modify our `reverseCharArray` function
to take explicit start and end indexes of the section we want reversed. This
allows us to only reverse part of the character array.

```java
public static void reverseCharArray(char [] sequence, int startIndex,
        int endIndex) {

    // Swap the ith character with the ith-from-the-end character.
    for (int i = 0; i < (endIndex - startIndex) / 2; i++) {
        char temp = sequence[startIndex + i];
        sequence[startIndex + i] = sequence[endIndex - 1 - i];
        sequence[endIndex - 1 - i] = temp;
    }
}
```

Now all we have to do is search for our delimiter character and use our new
`reverseCharArray` function to reverse the characters between occurrences. The
function has a runtime complexity of \\(O(n)\\) and an auxillary space
complexity of \\(O(1)\\). Here is the code:

```java
public static void reverseWordsInCharArray(char [] phrase,
        char delimiter) {

    // Keeps track of the location of the previous index of the delimiter.
    int start = 0;

    // Search the character array for the delimiter character.
    // Reverse the sequence between two delimiters.
    for (int i = 0; i < phrase.length; i++) {
        if (phrase[i] == delimiter) {
            reverseCharArray(phrase, start, i);
            start = ++i;
        }
    }

    // Reverse the characters between the last delimiter and the end of
    // the phrase.
    reverseCharArray(phrase, start, phrase.length);
}
```

You can take a look at all of the source code on Github
[here](https://github.com/adamheins/algorithms/blob/master/strings/reversal/StringReversal.java).

