from flask import Flask, render_template

app = Flask(__name__, template_folder="../templates", static_folder="../static")

@app.route("/")
def index():
    return render_template("agenda.html")

if __name__ == "__main__":
    app.run(debug = True, host = "127.0.0.1", port = 5000)