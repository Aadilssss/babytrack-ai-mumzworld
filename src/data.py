from datetime import datetime, timedelta

def d(days_ago):
    return (datetime(2026, 4, 28) - timedelta(days=days_ago)).strftime("%Y-%m-%d")

MOCK_MOMS = [
    {"id": 0, "name": "Sara", "language": "en", "orders": [
        {"date": d(180), "product": "maternity pillow", "quantity": 1},
        {"date": d(150), "product": "prenatal vitamins", "quantity": 2},
        {"date": d(120), "product": "bump band", "quantity": 1},
        {"date": d(90), "product": "hospital bag", "quantity": 1},
        {"date": d(60), "product": "nursery gear", "quantity": 2},
        {"date": d(30), "product": "baby monitor", "quantity": 1}
    ]},
    {"id": 1, "name": "Fatima", "language": "ar", "orders": [
        {"date": d(10), "product": "maternity pillow", "quantity": 1}
    ]},
    {"id": 2, "name": "Noura", "language": "ar", "orders": [
        {"date": d(400), "product": "maternity pillow", "quantity": 1},
        {"date": d(350), "product": "breast pump", "quantity": 1},
        {"date": d(300), "product": "feeding bottles", "quantity": 3},
        {"date": d(200), "product": "bouncer", "quantity": 1},
        {"date": d(100), "product": "high chair", "quantity": 1},
        {"date": d(10), "product": "walking shoes", "quantity": 1}
    ]},
    {"id": 3, "name": "Aisha", "language": "ar", "orders": [
        {"date": d(20), "product": "newborn diapers size 1", "quantity": 4},
        {"date": d(15), "product": "newborn clothes", "quantity": 1},
        {"date": d(5), "product": "bassinet", "quantity": 1}
    ]},
    {"id": 4, "name": "Layla", "language": "en", "orders": [
        {"date": d(120), "product": "size 2 diapers", "quantity": 2},
        {"date": d(60), "product": "tummy time mat", "quantity": 1},
        {"date": d(5), "product": "size 3 diapers", "quantity": 1}
    ]},
    {"id": 5, "name": "Maryam", "language": "ar", "orders": [
        {"date": d(5), "product": "newborn diapers size 1", "quantity": 1},
        {"date": d(5), "product": "toddler bed", "quantity": 1}
    ]},
    {"id": 6, "name": "Sarah", "language": "en", "orders": [
        {"date": d(30), "product": "learning toys", "quantity": 2},
        {"date": d(15), "product": "potty trainer", "quantity": 1}
    ]},
    {"id": 7, "name": "Hessa", "language": "ar", "orders": [
        {"date": d(45), "product": "swaddle blankets", "quantity": 3},
        {"date": d(10), "product": "size 2 diapers", "quantity": 2}
    ]},
    {"id": 8, "name": "Dana", "language": "en", "orders": [
        {"date": d(2), "product": "Early Baby Sensory Kit", "quantity": 1}
    ]},
    {"id": 9, "name": "Reem", "language": "ar", "orders": [
        {"date": d(20), "product": "hospital bag", "quantity": 1},
        {"date": d(1), "product": "newborn diapers size 1", "quantity": 2}
    ]},
    {"id": 10, "name": "Nour", "language": "ar", "orders": [
        {"date": d(150), "product": "size 3 diapers", "quantity": 4},
        {"date": d(5), "product": "sippy cup", "quantity": 2}
    ]},
    {"id": 11, "name": "Lina", "language": "en", "orders": [
        {"date": d(10), "product": "walking shoes", "quantity": 1},
        {"date": d(5), "product": "potty trainer", "quantity": 1}
    ]},
    {"id": 12, "name": "May", "language": "en", "orders": [
        {"date": d(30), "product": "newborn diapers size 1", "quantity": 3},
        {"date": d(14), "product": "newborn diapers size 1", "quantity": 3},
        {"date": d(2), "product": "newborn diapers size 1", "quantity": 3}
    ]},
    {"id": 13, "name": "Joud", "language": "ar", "orders": [
        {"date": d(40), "product": "Yoga Mat", "quantity": 1},
        {"date": d(5), "product": "Hand Blender", "quantity": 1}
    ]},
    {"id": 14, "name": "Rana", "language": "en", "orders": [
        {"date": d(30), "product": "maternity pillow", "quantity": 1},
        {"date": d(2), "product": "newborn diapers size 1", "quantity": 2}
    ]}
]
