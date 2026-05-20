import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Charger les donnees depuis le fichier JSON
with open("lignes_ddd.json", "r", encoding="utf-8") as f:
    lignes = json.load(f)


@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>", "/arrets", "/stats", "/lignes/recherche?q=..."]
    })


@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)


@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)


# ============================================
# EXERCICE 1 : Liste de tous les arrets (sans doublons)
# ============================================
@app.route("/arrets")
def get_arrets():
    tous_arrets = set()
    for ligne in lignes:
        for arret in ligne["listeArrets"]:
            tous_arrets.add(arret)
    return jsonify(sorted(list(tous_arrets)))


# ============================================
# EXERCICE 2 : Statistiques globales
# ============================================
@app.route("/stats")
def get_stats():
    nb_lignes = len(lignes)
    nb_arrets_total = sum(ligne["arrets"] for ligne in lignes)
    ligne_max = max(lignes, key=lambda l: l["arrets"])

    return jsonify({
        "nombre_total_lignes": nb_lignes,
        "nombre_total_arrets": nb_arrets_total,
        "ligne_la_plus_longue": {
            "numero": ligne_max["numero"],
            "arrets": ligne_max["arrets"]
        }
    })


# ============================================
# EXERCICE 3 : Recherche par depart ou arrivee
# ============================================
@app.route("/lignes/recherche")
def rechercher_lignes():
    q = request.args.get("q", "").lower()
    if not q:
        return jsonify(lignes)

    resultats = [
        ligne for ligne in lignes
        if q in ligne["depart"].lower() or q in ligne["arrivee"].lower()
    ]
    return jsonify(resultats)


if __name__ == "__main__":
    app.run(debug=True, port=5000)