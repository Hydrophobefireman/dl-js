import json
import re

import requests

DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3526.73 Safari/537.36"


class decrypt_error(Exception):
    def main(self):
        pass


class main_decrypt():
    def get_js(self, basejs_url, signature=' '):
        self.sig = signature
        self.data = requests.get(basejs_url, headers={
            "User-Agent": DESKTOP_USER_AGENT
        }).text
        reg = r'(["\'])signature\1\s*,\s*(?P<sig>[a-zA-Z0-9$]+)\('
        try:
            self.funcname = re.search(reg, self.data).group("sig")
        except Exception as e:
            print(e)
            raise decrypt_error(
                "Unable to obtain signature variable from JavaScript")
        func_re = r'''(?x)
				(?:function\s+%s|[{;,]\s*%s\s*=\s*function|var\s+%s\s*=\s*function)\s*
				\((?P<args>[^)]*)\)\s*
				\{(?P<code>[^}]+)\}''' % (
            re.escape(self.funcname), re.escape(self.funcname), re.escape(self.funcname))
        func_m = re.search(func_re, self.data)
        return self.parse_js(func_m, self.funcname)

    def parse_js(self, func, funcname):
        if func is None:
            raise decrypt_error("Cant extract function from the given code")
        args = func.group("args").split(",")
        code = func.group("code")
        self.g_func = func
        return self.build_function(args, code, self.sig)

    def build_function(self, args, code, sig):
        if len(args) == 0:
            raise decrypt_error(
                "Not a valid signature decrypt function;check for changes in the youtube base.js file")
        if len(args) < 1:
            raise NotImplementedError(
                "Mutiple agument not supported;signature functions should have only one argument")
        self.args = args[0]
        stmts = code.split(";")
        sub_func_name = None
        for st in stmts:
            name = st.split(".")
            if re.search(r"splice|split|reverse|join|slice", name[1]) is None:
                if sub_func_name:
                    if name[0] != sub_func_name:
                        raise decrypt_error(
                            "Different functions called from main function;not supported")
                else:
                    sub_func_name = name[0]
                    regs = r"(?s)var\s*%s.*?=.*?}};" % (
                        re.escape(sub_func_name))
                    func2 = re.search(regs, self.data).group()

        sig_js = func2+self.g_func.group()
        return sig_js, self.funcname
