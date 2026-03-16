# Page snapshot

```yaml
- generic [ref=e3]:
  - button [ref=e4] [cursor=pointer]:
    - img [ref=e5]
  - generic [ref=e7]:
    - heading "Freello" [level=1] [ref=e8]
    - generic [ref=e9]:
      - heading "Connexion" [level=2] [ref=e10]
      - paragraph [ref=e11]: Email ou mot de passe incorrect.
      - generic [ref=e12]:
        - text: Email
        - textbox "you@example.com" [ref=e13]: test@freello.com
      - generic [ref=e14]:
        - text: Mot de passe
        - textbox "••••••••" [ref=e15]: Test1234!
      - button "Se connecter" [ref=e16] [cursor=pointer]
```