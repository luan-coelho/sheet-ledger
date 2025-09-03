import pandas as pd

def excel_to_json(file_path: str, sheet_name: str = None):
    # Carrega a planilha
    df = pd.read_excel(file_path, sheet_name=0)  # 0 = primeira aba

    # Estrutura headers
    headers = {f"{chr(65+i)}1": col for i, col in enumerate(df.columns)}

    # Estrutura linhas (cada célula com referência tipo A2, B2, etc.)
    rows = []
    for row_idx, row in df.iterrows():
        row_dict = {}
        for col_idx, value in enumerate(row):
            cell_ref = f"{chr(65+col_idx)}{row_idx+2}"  # +2 pois começa na linha 2
            row_dict[cell_ref] = value
        rows.append(row_dict)

    return {"headers": headers, "rows": rows}


# Exemplo de uso
data = excel_to_json('/home/luan/Projects/sheet-ledger/src/data/model.xlsx')
print(data)
