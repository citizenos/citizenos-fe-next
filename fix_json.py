import json

def fix_json(file_path, filter_type, filter_order_by):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if "COMPONENTS" in data and "TOPIC_ARGUMENTS" in data["COMPONENTS"]:
        args = data["COMPONENTS"]["TOPIC_ARGUMENTS"]
        if "FILTER_TYPE" not in args:
            args["FILTER_TYPE"] = filter_type
        if "FILTER_ORDER_BY" not in args:
            args["FILTER_ORDER_BY"] = filter_order_by
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

fix_json('public/assets/i18n/et.json', 'Filtreeri', 'Järjesta')
fix_json('public/assets/i18n/en.json', 'Filter', 'Sort by')

