"""A small Molang interpreter: enough of the language to run a resource pack's entity scripts and
render controller expressions with made-up query values."""
import math
import re

TOKEN = re.compile(r"\s*(?:(\d+\.\d*|\.\d+|\d+)f?|('[^']*')|([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*)|(\?\?|\|\||&&|==|!=|<=|>=|->|[?:<>+\-*/!=()\[\]{},;]))")
UNSET = object()


class Break(Exception):
    pass


class Continue(Exception):
    pass


class Return(Exception):
    def __init__(self, value):
        self.value = value


def tokenize(src):
    out, pos = [], 0
    src = src.strip()
    while pos < len(src):
        m = TOKEN.match(src, pos)
        if not m or m.end() == pos:
            if src[pos:].strip() == "":
                break
            raise SyntaxError(f"bad token at {src[pos:pos + 30]!r}")
        num, s, name, op = m.groups()
        pos = m.end()
        if num is not None:
            out.append(("num", float(num)))
        elif s is not None:
            out.append(("str", s[1:-1]))
        elif name is not None:
            out.append(("name", name))
        elif op is not None:
            out.append(("op", op))
    return out


class Parser:
    def __init__(self, src):
        self.t, self.i = tokenize(src), 0

    def peek(self, v=None):
        if self.i >= len(self.t):
            return None
        tok = self.t[self.i]
        return tok if v is None or tok[1] == v else None

    def take(self, v=None):
        tok = self.peek(v)
        if tok is None:
            raise SyntaxError(f"expected {v!r} at token {self.i}: {self.t[self.i:self.i + 5]}")
        self.i += 1
        return tok

    def program(self, end=None):
        stmts = []
        while self.peek() is not None and not (end and self.peek(end)):
            if self.peek(";"):
                self.i += 1
                continue
            stmts.append(self.statement())
            if self.peek(";"):
                self.i += 1
        return ("prog", stmts)

    def statement(self):
        tok = self.peek()
        if tok and tok[0] == "name" and tok[1] in ("return", "break", "continue"):
            self.i += 1
            if tok[1] == "return":
                return ("return", self.expr())
            return (tok[1],)
        return self.expr()

    def expr(self):
        left = self.conditional()
        if self.peek("="):
            self.i += 1
            return ("assign", left, self.expr())
        return left

    def branch(self):
        if self.peek("{"):
            self.i += 1
            body = self.program("}")
            self.take("}")
            return body
        return self.conditional()

    def conditional(self):
        cond = self.coalesce()
        if self.peek("?"):
            self.i += 1
            yes = self.branch()
            no = None
            if self.peek(":"):
                self.i += 1
                no = self.branch()
            return ("if", cond, yes, no)
        return cond

    def binary(self, ops, sub):
        left = sub()
        while self.peek() and self.peek()[0] == "op" and self.peek()[1] in ops:
            op = self.take()[1]
            left = ("bin", op, left, sub())
        return left

    def coalesce(self):
        return self.binary(("??",), self.orr)

    def orr(self):
        return self.binary(("||",), self.andd)

    def andd(self):
        return self.binary(("&&",), self.eq)

    def eq(self):
        return self.binary(("==", "!="), self.rel)

    def rel(self):
        return self.binary(("<", "<=", ">", ">="), self.add)

    def add(self):
        return self.binary(("+", "-"), self.mul)

    def mul(self):
        return self.binary(("*", "/"), self.unary)

    def unary(self):
        if self.peek("!"):
            self.i += 1
            return ("not", self.unary())
        if self.peek("-"):
            self.i += 1
            return ("neg", self.unary())
        return self.postfix()

    def postfix(self):
        node = self.primary()
        while True:
            if self.peek("["):
                self.i += 1
                idx = self.expr()
                self.take("]")
                node = ("index", node, idx)
            elif self.peek("->"):
                self.i += 1
                node = ("arrow", node, self.postfix())
            else:
                return node

    def primary(self):
        tok = self.take()
        kind, v = tok
        if kind in ("num", "str"):
            return ("lit", v)
        if kind == "op" and v == "(":
            e = self.expr()
            self.take(")")
            return e
        if kind == "op" and v == "{":
            body = self.program("}")
            self.take("}")
            return body
        if kind == "name":
            if v.lower() in ("true", "false"):
                return ("lit", 1.0 if v.lower() == "true" else 0.0)
            if self.peek("("):
                self.i += 1
                args = []
                while not self.peek(")"):
                    args.append(self.branch() if self.peek("{") else self.expr())
                    if self.peek(","):
                        self.i += 1
                self.take(")")
                return ("call", v, args)
            return ("var", v)
        raise SyntaxError(f"unexpected {tok}")


PREFIX = {"v": "v", "variable": "v", "t": "t", "temp": "t", "c": "c", "context": "c", "q": "q", "query": "q",
          "math": "math", "array": "array", "geometry": "geometry", "texture": "texture", "material": "material"}


def split(name):
    head, _, rest = name.partition(".")
    return PREFIX.get(head.lower(), head.lower()), rest.lower()


def num(x):
    if x is UNSET or x is None:
        return 0.0
    if isinstance(x, bool):
        return 1.0 if x else 0.0
    if isinstance(x, (int, float)):
        return float(x)
    return x


def truthy(x):
    x = num(x)
    return bool(x) if not isinstance(x, str) else x != ""


MATH = {
    "abs": abs, "ceil": math.ceil, "floor": math.floor, "round": round, "sqrt": lambda x: math.sqrt(max(0, x)),
    "min": min, "max": max, "pow": lambda a, b: a ** b if a or b > 0 else 0, "mod": lambda a, b: math.fmod(a, b) if b else 0,
    "clamp": lambda x, lo, hi: max(lo, min(hi, x)), "lerp": lambda a, b, t: a + (b - a) * t,
    "sin": lambda d: math.sin(math.radians(d)), "cos": lambda d: math.cos(math.radians(d)),
    "random": lambda a, b: (a + b) / 2, "random_integer": lambda a, b: math.floor((a + b) / 2), "die_roll": lambda n, a, b: n * a, "die_roll_integer": lambda n, a, b: n * a,
    "min_angle": lambda a: (a + 180) % 360 - 180, "hermite_blend": lambda t: 3 * t * t - 2 * t * t * t, "trunc": math.trunc,
    "exp": math.exp, "ln": lambda x: math.log(x) if x > 0 else 0, "pi": math.pi, "atan2": lambda y, x: math.degrees(math.atan2(y, x)),
    "atan": lambda x: math.degrees(math.atan(x)), "asin": lambda x: math.degrees(math.asin(max(-1, min(1, x)))),
    "acos": lambda x: math.degrees(math.acos(max(-1, min(1, x)))), "sign": lambda x: (x > 0) - (x < 0),
}


class Env:
    """Variables (v.), temps (t.) and context (c.) plus query values; arrays/geometry/texture names for render controllers."""

    def __init__(self, queries, arrays=None, v=None, c=None):
        self.q, self.arrays = queries, arrays or {}
        self.v, self.t, self.c = v if v is not None else {}, {}, c or {}

    def get(self, name):
        kind, key = split(name)
        if kind in ("v", "t", "c"):
            return getattr(self, kind).get(key, UNSET)
        if kind == "q":
            val = self.q.get(key, 0.0)
            return val() if callable(val) else val
        if kind == "math" and key == "pi":
            return math.pi
        if kind == "array":
            return self.arrays.get(key, [])
        if kind in ("geometry", "texture", "material"):
            return (kind, key)
        return UNSET

    def set(self, name, value):
        kind, key = split(name)
        if kind in ("v", "t", "c"):
            getattr(self, kind)[key] = value


def run(node, env):
    kind = node[0]
    if kind == "prog":
        last = 0.0
        for s in node[1]:
            last = run(s, env)
        return last
    if kind == "lit":
        return node[1]
    if kind == "var":
        return env.get(node[1])
    if kind == "assign":
        if node[1][0] != "var":
            raise SyntaxError("can only assign to variables")
        val = run(node[2], env)
        env.set(node[1][1], val)
        return val
    if kind == "return":
        raise Return(run(node[1], env))
    if kind == "break":
        raise Break()
    if kind == "continue":
        raise Continue()
    if kind == "if":
        if truthy(run(node[1], env)):
            return run(node[2], env)
        return run(node[3], env) if node[3] is not None else 0.0
    if kind == "not":
        return 0.0 if truthy(run(node[1], env)) else 1.0
    if kind == "neg":
        return -num(run(node[1], env))
    if kind == "bin":
        op, a = node[1], node[2]
        if op == "&&":
            return 1.0 if truthy(run(a, env)) and truthy(run(node[3], env)) else 0.0
        if op == "||":
            return 1.0 if truthy(run(a, env)) or truthy(run(node[3], env)) else 0.0
        if op == "??":
            left = run(a, env)
            return run(node[3], env) if left is UNSET else left
        x, y = num(run(a, env)), num(run(node[3], env))
        if op == "==":
            return 1.0 if x == y else 0.0
        if op == "!=":
            return 1.0 if x != y else 0.0
        if isinstance(x, str) or isinstance(y, str):
            return 0.0
        if op == "<": return 1.0 if x < y else 0.0
        if op == "<=": return 1.0 if x <= y else 0.0
        if op == ">": return 1.0 if x > y else 0.0
        if op == ">=": return 1.0 if x >= y else 0.0
        if op == "+": return x + y
        if op == "-": return x - y
        if op == "*": return x * y
        if op == "/": return x / y if y else 0.0
    if kind == "index":
        arr, i = run(node[1], env), num(run(node[2], env))
        if not isinstance(arr, list) or not arr:
            return 0.0
        i = int(math.floor(i)) if not isinstance(i, str) else 0
        return arr[max(0, min(len(arr) - 1, i))]
    if kind == "arrow":
        return 0.0
    if kind == "call":
        name, args = node[1], node[2]
        k, key = split(name)
        if k == "math":
            vals = [num(run(a, env)) for a in args]
            fn = MATH.get(key)
            try:
                return float(fn(*vals)) if fn else 0.0
            except (TypeError, ValueError, OverflowError, ZeroDivisionError):
                return 0.0
        if name.lower() == "loop":
            count = int(num(run(args[0], env)))
            for _ in range(min(count, 1024)):
                try:
                    run(args[1], env)
                except Continue:
                    continue
                except Break:
                    break
            return 0.0
        if name.lower() == "for_each":
            return 0.0
        if k == "q":
            fn = env.q.get(key)
            vals = [run(a, env) for a in args]
            if callable(fn):
                return fn(*vals)
            return fn if fn is not None else 0.0
        return 0.0
    raise ValueError(f"unknown node {kind}")


CACHE = {}


def parse(src):
    if src not in CACHE:
        CACHE[src] = Parser(src).program()
    return CACHE[src]


def evaluate(src, env):
    """Run a script or expression (a number, bool or string as JSON gives it) and return its value."""
    if isinstance(src, bool):
        return 1.0 if src else 0.0
    if isinstance(src, (int, float)):
        return float(src)
    try:
        return run(parse(src), env)
    except Return as r:
        return r.value
