var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var visitor = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visit = visit;
exports.visitInParallel = visitInParallel;
exports.visitWithTypeInfo = visitWithTypeInfo;
exports.getVisitFn = getVisitFn;


/**
 * A visitor is comprised of visit functions, which are called on each node
 * during the visitor's traversal.
 */


/**
 * A visitor is provided to visit, it contains the collection of
 * relevant functions to be called during the visitor's traversal.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

var QueryDocumentKeys = exports.QueryDocumentKeys = {
  Name: [],

  Document: ['definitions'],
  OperationDefinition: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
  VariableDefinition: ['variable', 'type', 'defaultValue'],
  Variable: ['name'],
  SelectionSet: ['selections'],
  Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
  Argument: ['name', 'value'],

  FragmentSpread: ['name', 'directives'],
  InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
  FragmentDefinition: ['name',
  // Note: fragment variable definitions are experimental and may be changed
  // or removed in the future.
  'variableDefinitions', 'typeCondition', 'directives', 'selectionSet'],

  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ['values'],
  ObjectValue: ['fields'],
  ObjectField: ['name', 'value'],

  Directive: ['name', 'arguments'],

  NamedType: ['name'],
  ListType: ['type'],
  NonNullType: ['type'],

  SchemaDefinition: ['directives', 'operationTypes'],
  OperationTypeDefinition: ['type'],

  ScalarTypeDefinition: ['description', 'name', 'directives'],
  ObjectTypeDefinition: ['description', 'name', 'interfaces', 'directives', 'fields'],
  FieldDefinition: ['description', 'name', 'arguments', 'type', 'directives'],
  InputValueDefinition: ['description', 'name', 'type', 'defaultValue', 'directives'],
  InterfaceTypeDefinition: ['description', 'name', 'directives', 'fields'],
  UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
  EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
  EnumValueDefinition: ['description', 'name', 'directives'],
  InputObjectTypeDefinition: ['description', 'name', 'directives', 'fields'],

  ScalarTypeExtension: ['name', 'directives'],
  ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
  InterfaceTypeExtension: ['name', 'directives', 'fields'],
  UnionTypeExtension: ['name', 'directives', 'types'],
  EnumTypeExtension: ['name', 'directives', 'values'],
  InputObjectTypeExtension: ['name', 'directives', 'fields'],

  DirectiveDefinition: ['description', 'name', 'arguments', 'locations']
};

/**
 * A KeyMap describes each the traversable properties of each kind of node.
 */
var BREAK = exports.BREAK = {};

/**
 * visit() will walk through an AST using a depth first traversal, calling
 * the visitor's enter function at each node in the traversal, and calling the
 * leave function after visiting that node and all of its child nodes.
 *
 * By returning different values from the enter and leave functions, the
 * behavior of the visitor can be altered, including skipping over a sub-tree of
 * the AST (by returning false), editing the AST by returning a value or null
 * to remove the value, or to stop the whole traversal by returning BREAK.
 *
 * When using visit() to edit an AST, the original AST will not be modified, and
 * a new version of the AST with the changes applied will be returned from the
 * visit function.
 *
 *     const editedAST = visit(ast, {
 *       enter(node, key, parent, path, ancestors) {
 *         // @return
 *         //   undefined: no action
 *         //   false: skip visiting this node
 *         //   visitor.BREAK: stop visiting altogether
 *         //   null: delete this node
 *         //   any value: replace this node with the returned value
 *       },
 *       leave(node, key, parent, path, ancestors) {
 *         // @return
 *         //   undefined: no action
 *         //   false: no action
 *         //   visitor.BREAK: stop visiting altogether
 *         //   null: delete this node
 *         //   any value: replace this node with the returned value
 *       }
 *     });
 *
 * Alternatively to providing enter() and leave() functions, a visitor can
 * instead provide functions named the same as the kinds of AST nodes, or
 * enter/leave visitors at a named key, leading to four permutations of
 * visitor API:
 *
 * 1) Named visitors triggered when entering a node a specific kind.
 *
 *     visit(ast, {
 *       Kind(node) {
 *         // enter the "Kind" node
 *       }
 *     })
 *
 * 2) Named visitors that trigger upon entering and leaving a node of
 *    a specific kind.
 *
 *     visit(ast, {
 *       Kind: {
 *         enter(node) {
 *           // enter the "Kind" node
 *         }
 *         leave(node) {
 *           // leave the "Kind" node
 *         }
 *       }
 *     })
 *
 * 3) Generic visitors that trigger upon entering and leaving any node.
 *
 *     visit(ast, {
 *       enter(node) {
 *         // enter any node
 *       },
 *       leave(node) {
 *         // leave any node
 *       }
 *     })
 *
 * 4) Parallel visitors for entering and leaving nodes of a specific kind.
 *
 *     visit(ast, {
 *       enter: {
 *         Kind(node) {
 *           // enter the "Kind" node
 *         }
 *       },
 *       leave: {
 *         Kind(node) {
 *           // leave the "Kind" node
 *         }
 *       }
 *     })
 */
function visit(root, visitor) {
  var visitorKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : QueryDocumentKeys;

  /* eslint-disable no-undef-init */
  var stack = undefined;
  var inArray = Array.isArray(root);
  var keys = [root];
  var index = -1;
  var edits = [];
  var node = undefined;
  var key = undefined;
  var parent = undefined;
  var path = [];
  var ancestors = [];
  var newRoot = root;
  /* eslint-enable no-undef-init */

  do {
    index++;
    var isLeaving = index === keys.length;
    var isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
        } else {
          var clone = {};
          for (var k in node) {
            if (node.hasOwnProperty(k)) {
              clone[k] = node[k];
            }
          }
          node = clone;
        }
        var editOffset = 0;
        for (var ii = 0; ii < edits.length; ii++) {
          var editKey = edits[ii][0];
          var editValue = edits[ii][1];
          if (inArray) {
            editKey -= editOffset;
          }
          if (inArray && editValue === null) {
            node.splice(editKey, 1);
            editOffset++;
          } else {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else {
      key = parent ? inArray ? index : keys[index] : undefined;
      node = parent ? parent[key] : newRoot;
      if (node === null || node === undefined) {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }

    var result = void 0;
    if (!Array.isArray(node)) {
      if (!isNode(node)) {
        throw new Error('Invalid AST Node: ' + JSON.stringify(node));
      }
      var visitFn = getVisitFn(visitor, node.kind, isLeaving);
      if (visitFn) {
        result = visitFn.call(visitor, node, key, parent, path, ancestors);

        if (result === BREAK) {
          break;
        }

        if (result === false) {
          if (!isLeaving) {
            path.pop();
            continue;
          }
        } else if (result !== undefined) {
          edits.push([key, result]);
          if (!isLeaving) {
            if (isNode(result)) {
              node = result;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
    }

    if (result === undefined && isEdited) {
      edits.push([key, node]);
    }

    if (isLeaving) {
      path.pop();
    } else {
      stack = { inArray: inArray, index: index, keys: keys, edits: edits, prev: stack };
      inArray = Array.isArray(node);
      keys = inArray ? node : visitorKeys[node.kind] || [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== undefined);

  if (edits.length !== 0) {
    newRoot = edits[edits.length - 1][1];
  }

  return newRoot;
}

function isNode(maybeNode) {
  return Boolean(maybeNode && typeof maybeNode.kind === 'string');
}

/**
 * Creates a new visitor instance which delegates to many visitors to run in
 * parallel. Each visitor will be visited for each node before moving on.
 *
 * If a prior visitor edits a node, no following visitors will see that node.
 */
function visitInParallel(visitors) {
  var skipping = new Array(visitors.length);

  return {
    enter: function enter(node) {
      for (var i = 0; i < visitors.length; i++) {
        if (!skipping[i]) {
          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */false);
          if (fn) {
            var result = fn.apply(visitors[i], arguments);
            if (result === false) {
              skipping[i] = node;
            } else if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== undefined) {
              return result;
            }
          }
        }
      }
    },
    leave: function leave(node) {
      for (var i = 0; i < visitors.length; i++) {
        if (!skipping[i]) {
          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */true);
          if (fn) {
            var result = fn.apply(visitors[i], arguments);
            if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== undefined && result !== false) {
              return result;
            }
          }
        } else if (skipping[i] === node) {
          skipping[i] = null;
        }
      }
    }
  };
}

/**
 * Creates a new visitor instance which maintains a provided TypeInfo instance
 * along with visiting visitor.
 */
function visitWithTypeInfo(typeInfo, visitor) {
  return {
    enter: function enter(node) {
      typeInfo.enter(node);
      var fn = getVisitFn(visitor, node.kind, /* isLeaving */false);
      if (fn) {
        var result = fn.apply(visitor, arguments);
        if (result !== undefined) {
          typeInfo.leave(node);
          if (isNode(result)) {
            typeInfo.enter(result);
          }
        }
        return result;
      }
    },
    leave: function leave(node) {
      var fn = getVisitFn(visitor, node.kind, /* isLeaving */true);
      var result = void 0;
      if (fn) {
        result = fn.apply(visitor, arguments);
      }
      typeInfo.leave(node);
      return result;
    }
  };
}

/**
 * Given a visitor instance, if it is leaving or not, and a node kind, return
 * the function the visitor runtime should call.
 */
function getVisitFn(visitor, kind, isLeaving) {
  var kindVisitor = visitor[kind];
  if (kindVisitor) {
    if (!isLeaving && typeof kindVisitor === 'function') {
      // { Kind() {} }
      return kindVisitor;
    }
    var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;
    if (typeof kindSpecificVisitor === 'function') {
      // { Kind: { enter() {}, leave() {} } }
      return kindSpecificVisitor;
    }
  } else {
    var specificVisitor = isLeaving ? visitor.leave : visitor.enter;
    if (specificVisitor) {
      if (typeof specificVisitor === 'function') {
        // { enter() {}, leave() {} }
        return specificVisitor;
      }
      var specificKindVisitor = specificVisitor[kind];
      if (typeof specificKindVisitor === 'function') {
        // { enter: { Kind() {} }, leave: { Kind() {} } }
        return specificKindVisitor;
      }
    }
  }
}
});

unwrapExports(visitor);

var printer$1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.print = print;



/**
 * Converts an AST into a string, using one set of reasonable
 * formatting rules.
 */
function print(ast) {
  return (0, visitor.visit)(ast, { leave: printDocASTReducer });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

var printDocASTReducer = {
  Name: function Name(node) {
    return node.value;
  },
  Variable: function Variable(node) {
    return '$' + node.name;
  },

  // Document

  Document: function Document(node) {
    return join(node.definitions, '\n\n') + '\n';
  },

  OperationDefinition: function OperationDefinition(node) {
    var op = node.operation;
    var name = node.name;
    var varDefs = wrap('(', join(node.variableDefinitions, ', '), ')');
    var directives = join(node.directives, ' ');
    var selectionSet = node.selectionSet;
    // Anonymous queries with no directives or variable definitions can use
    // the query short form.
    return !name && !directives && !varDefs && op === 'query' ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], ' ');
  },


  VariableDefinition: function VariableDefinition(_ref) {
    var variable = _ref.variable,
        type = _ref.type,
        defaultValue = _ref.defaultValue;
    return variable + ': ' + type + wrap(' = ', defaultValue);
  },

  SelectionSet: function SelectionSet(_ref2) {
    var selections = _ref2.selections;
    return block(selections);
  },

  Field: function Field(_ref3) {
    var alias = _ref3.alias,
        name = _ref3.name,
        args = _ref3.arguments,
        directives = _ref3.directives,
        selectionSet = _ref3.selectionSet;
    return join([wrap('', alias, ': ') + name + wrap('(', join(args, ', '), ')'), join(directives, ' '), selectionSet], ' ');
  },

  Argument: function Argument(_ref4) {
    var name = _ref4.name,
        value = _ref4.value;
    return name + ': ' + value;
  },

  // Fragments

  FragmentSpread: function FragmentSpread(_ref5) {
    var name = _ref5.name,
        directives = _ref5.directives;
    return '...' + name + wrap(' ', join(directives, ' '));
  },

  InlineFragment: function InlineFragment(_ref6) {
    var typeCondition = _ref6.typeCondition,
        directives = _ref6.directives,
        selectionSet = _ref6.selectionSet;
    return join(['...', wrap('on ', typeCondition), join(directives, ' '), selectionSet], ' ');
  },

  FragmentDefinition: function FragmentDefinition(_ref7) {
    var name = _ref7.name,
        typeCondition = _ref7.typeCondition,
        variableDefinitions = _ref7.variableDefinitions,
        directives = _ref7.directives,
        selectionSet = _ref7.selectionSet;
    return (
      // Note: fragment variable definitions are experimental and may be changed
      // or removed in the future.
      'fragment ' + name + wrap('(', join(variableDefinitions, ', '), ')') + ' ' + ('on ' + typeCondition + ' ' + wrap('', join(directives, ' '), ' ')) + selectionSet
    );
  },

  // Value

  IntValue: function IntValue(_ref8) {
    var value = _ref8.value;
    return value;
  },
  FloatValue: function FloatValue(_ref9) {
    var value = _ref9.value;
    return value;
  },
  StringValue: function StringValue(_ref10, key) {
    var value = _ref10.value,
        isBlockString = _ref10.block;
    return isBlockString ? printBlockString(value, key === 'description') : JSON.stringify(value);
  },
  BooleanValue: function BooleanValue(_ref11) {
    var value = _ref11.value;
    return value ? 'true' : 'false';
  },
  NullValue: function NullValue() {
    return 'null';
  },
  EnumValue: function EnumValue(_ref12) {
    var value = _ref12.value;
    return value;
  },
  ListValue: function ListValue(_ref13) {
    var values = _ref13.values;
    return '[' + join(values, ', ') + ']';
  },
  ObjectValue: function ObjectValue(_ref14) {
    var fields = _ref14.fields;
    return '{' + join(fields, ', ') + '}';
  },
  ObjectField: function ObjectField(_ref15) {
    var name = _ref15.name,
        value = _ref15.value;
    return name + ': ' + value;
  },

  // Directive

  Directive: function Directive(_ref16) {
    var name = _ref16.name,
        args = _ref16.arguments;
    return '@' + name + wrap('(', join(args, ', '), ')');
  },

  // Type

  NamedType: function NamedType(_ref17) {
    var name = _ref17.name;
    return name;
  },
  ListType: function ListType(_ref18) {
    var type = _ref18.type;
    return '[' + type + ']';
  },
  NonNullType: function NonNullType(_ref19) {
    var type = _ref19.type;
    return type + '!';
  },

  // Type System Definitions

  SchemaDefinition: function SchemaDefinition(_ref20) {
    var directives = _ref20.directives,
        operationTypes = _ref20.operationTypes;
    return join(['schema', join(directives, ' '), block(operationTypes)], ' ');
  },

  OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
    var operation = _ref21.operation,
        type = _ref21.type;
    return operation + ': ' + type;
  },

  ScalarTypeDefinition: addDescription(function (_ref22) {
    var name = _ref22.name,
        directives = _ref22.directives;
    return join(['scalar', name, join(directives, ' ')], ' ');
  }),

  ObjectTypeDefinition: addDescription(function (_ref23) {
    var name = _ref23.name,
        interfaces = _ref23.interfaces,
        directives = _ref23.directives,
        fields = _ref23.fields;
    return join(['type', name, wrap('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
  }),

  FieldDefinition: addDescription(function (_ref24) {
    var name = _ref24.name,
        args = _ref24.arguments,
        type = _ref24.type,
        directives = _ref24.directives;
    return name + wrap('(', join(args, ', '), ')') + ': ' + type + wrap(' ', join(directives, ' '));
  }),

  InputValueDefinition: addDescription(function (_ref25) {
    var name = _ref25.name,
        type = _ref25.type,
        defaultValue = _ref25.defaultValue,
        directives = _ref25.directives;
    return join([name + ': ' + type, wrap('= ', defaultValue), join(directives, ' ')], ' ');
  }),

  InterfaceTypeDefinition: addDescription(function (_ref26) {
    var name = _ref26.name,
        directives = _ref26.directives,
        fields = _ref26.fields;
    return join(['interface', name, join(directives, ' '), block(fields)], ' ');
  }),

  UnionTypeDefinition: addDescription(function (_ref27) {
    var name = _ref27.name,
        directives = _ref27.directives,
        types = _ref27.types;
    return join(['union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
  }),

  EnumTypeDefinition: addDescription(function (_ref28) {
    var name = _ref28.name,
        directives = _ref28.directives,
        values = _ref28.values;
    return join(['enum', name, join(directives, ' '), block(values)], ' ');
  }),

  EnumValueDefinition: addDescription(function (_ref29) {
    var name = _ref29.name,
        directives = _ref29.directives;
    return join([name, join(directives, ' ')], ' ');
  }),

  InputObjectTypeDefinition: addDescription(function (_ref30) {
    var name = _ref30.name,
        directives = _ref30.directives,
        fields = _ref30.fields;
    return join(['input', name, join(directives, ' '), block(fields)], ' ');
  }),

  ScalarTypeExtension: function ScalarTypeExtension(_ref31) {
    var name = _ref31.name,
        directives = _ref31.directives;
    return join(['extend scalar', name, join(directives, ' ')], ' ');
  },

  ObjectTypeExtension: function ObjectTypeExtension(_ref32) {
    var name = _ref32.name,
        interfaces = _ref32.interfaces,
        directives = _ref32.directives,
        fields = _ref32.fields;
    return join(['extend type', name, wrap('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
  },

  InterfaceTypeExtension: function InterfaceTypeExtension(_ref33) {
    var name = _ref33.name,
        directives = _ref33.directives,
        fields = _ref33.fields;
    return join(['extend interface', name, join(directives, ' '), block(fields)], ' ');
  },

  UnionTypeExtension: function UnionTypeExtension(_ref34) {
    var name = _ref34.name,
        directives = _ref34.directives,
        types = _ref34.types;
    return join(['extend union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
  },

  EnumTypeExtension: function EnumTypeExtension(_ref35) {
    var name = _ref35.name,
        directives = _ref35.directives,
        values = _ref35.values;
    return join(['extend enum', name, join(directives, ' '), block(values)], ' ');
  },

  InputObjectTypeExtension: function InputObjectTypeExtension(_ref36) {
    var name = _ref36.name,
        directives = _ref36.directives,
        fields = _ref36.fields;
    return join(['extend input', name, join(directives, ' '), block(fields)], ' ');
  },

  DirectiveDefinition: addDescription(function (_ref37) {
    var name = _ref37.name,
        args = _ref37.arguments,
        locations = _ref37.locations;
    return 'directive @' + name + wrap('(', join(args, ', '), ')') + ' on ' + join(locations, ' | ');
  })
};

function addDescription(cb) {
  return function (node) {
    return join([node.description, cb(node)], '\n');
  };
}

/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise
 * print all items together separated by separator if provided
 */
function join(maybeArray, separator) {
  return maybeArray ? maybeArray.filter(function (x) {
    return x;
  }).join(separator || '') : '';
}

/**
 * Given array, print each item on its own line, wrapped in an
 * indented "{ }" block.
 */
function block(array) {
  return array && array.length !== 0 ? '{\n' + indent(join(array, '\n')) + '\n}' : '';
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise
 * print an empty string.
 */
function wrap(start, maybeString, end) {
  return maybeString ? start + maybeString + (end || '') : '';
}

function indent(maybeString) {
  return maybeString && '  ' + maybeString.replace(/\n/g, '\n  ');
}

/**
 * Print a block string in the indented block form by adding a leading and
 * trailing blank line. However, if a block string starts with whitespace and is
 * a single-line, adding a leading blank line would strip that whitespace.
 */
function printBlockString(value, isDescription) {
  var escaped = value.replace(/"""/g, '\\"""');
  return (value[0] === ' ' || value[0] === '\t') && value.indexOf('\n') === -1 ? '"""' + escaped.replace(/"$/, '"\n') + '"""' : '"""\n' + (isDescription ? escaped : indent(escaped)) + '\n"""';
}
});

unwrapExports(printer$1);
var printer_1 = printer$1.print;

var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function isScalarValue(value) {
    return ['StringValue', 'BooleanValue', 'EnumValue'].indexOf(value.kind) > -1;
}
function isNumberValue(value) {
    return ['IntValue', 'FloatValue'].indexOf(value.kind) > -1;
}
function isStringValue(value) {
    return value.kind === 'StringValue';
}
function isBooleanValue(value) {
    return value.kind === 'BooleanValue';
}
function isIntValue(value) {
    return value.kind === 'IntValue';
}
function isFloatValue(value) {
    return value.kind === 'FloatValue';
}
function isVariable(value) {
    return value.kind === 'Variable';
}
function isObjectValue(value) {
    return value.kind === 'ObjectValue';
}
function isListValue(value) {
    return value.kind === 'ListValue';
}
function isEnumValue(value) {
    return value.kind === 'EnumValue';
}
function isNullValue(value) {
    return value.kind === 'NullValue';
}
function valueToObjectRepresentation(argObj, name, value, variables) {
    if (isIntValue(value) || isFloatValue(value)) {
        argObj[name.value] = Number(value.value);
    }
    else if (isBooleanValue(value) || isStringValue(value)) {
        argObj[name.value] = value.value;
    }
    else if (isObjectValue(value)) {
        var nestedArgObj_1 = {};
        value.fields.map(function (obj) {
            return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
        });
        argObj[name.value] = nestedArgObj_1;
    }
    else if (isVariable(value)) {
        var variableValue = (variables || {})[value.name.value];
        argObj[name.value] = variableValue;
    }
    else if (isListValue(value)) {
        argObj[name.value] = value.values.map(function (listValue) {
            var nestedArgArrayObj = {};
            valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
            return nestedArgArrayObj[name.value];
        });
    }
    else if (isEnumValue(value)) {
        argObj[name.value] = value.value;
    }
    else if (isNullValue(value)) {
        argObj[name.value] = null;
    }
    else {
        throw new Error("The inline argument \"" + name.value + "\" of kind \"" + value.kind + "\" is not supported.\n                    Use variables instead of inline arguments to overcome this limitation.");
    }
}
function storeKeyNameFromField(field, variables) {
    var directivesObj = null;
    if (field.directives) {
        directivesObj = {};
        field.directives.forEach(function (directive) {
            directivesObj[directive.name.value] = {};
            if (directive.arguments) {
                directive.arguments.forEach(function (_a) {
                    var name = _a.name, value = _a.value;
                    return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
                });
            }
        });
    }
    var argObj = null;
    if (field.arguments && field.arguments.length) {
        argObj = {};
        field.arguments.forEach(function (_a) {
            var name = _a.name, value = _a.value;
            return valueToObjectRepresentation(argObj, name, value, variables);
        });
    }
    return getStoreKeyName(field.name.value, argObj, directivesObj);
}
var KNOWN_DIRECTIVES = [
    'connection',
    'include',
    'skip',
    'client',
    'rest',
    'export',
];
function getStoreKeyName(fieldName, args, directives) {
    if (directives &&
        directives['connection'] &&
        directives['connection']['key']) {
        if (directives['connection']['filter'] &&
            directives['connection']['filter'].length > 0) {
            var filterKeys = directives['connection']['filter']
                ? directives['connection']['filter']
                : [];
            filterKeys.sort();
            var queryArgs_1 = args;
            var filteredArgs_1 = {};
            filterKeys.forEach(function (key) {
                filteredArgs_1[key] = queryArgs_1[key];
            });
            return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs_1) + ")";
        }
        else {
            return directives['connection']['key'];
        }
    }
    var completeFieldName = fieldName;
    if (args) {
        var stringifiedArgs = JSON.stringify(args);
        completeFieldName += "(" + stringifiedArgs + ")";
    }
    if (directives) {
        Object.keys(directives).forEach(function (key) {
            if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
                return;
            if (directives[key] && Object.keys(directives[key]).length) {
                completeFieldName += "@" + key + "(" + JSON.stringify(directives[key]) + ")";
            }
            else {
                completeFieldName += "@" + key;
            }
        });
    }
    return completeFieldName;
}
function argumentsObjectFromField(field, variables) {
    if (field.arguments && field.arguments.length) {
        var argObj_1 = {};
        field.arguments.forEach(function (_a) {
            var name = _a.name, value = _a.value;
            return valueToObjectRepresentation(argObj_1, name, value, variables);
        });
        return argObj_1;
    }
    return null;
}
function resultKeyNameFromField(field) {
    return field.alias ? field.alias.value : field.name.value;
}
function isField(selection) {
    return selection.kind === 'Field';
}
function isInlineFragment(selection) {
    return selection.kind === 'InlineFragment';
}
function isIdValue(idObject) {
    return idObject && idObject.type === 'id';
}
function toIdValue(idConfig, generated) {
    if (generated === void 0) { generated = false; }
    return __assign$1({ type: 'id', generated: generated }, (typeof idConfig === 'string'
        ? { id: idConfig, typename: undefined }
        : idConfig));
}
function isJsonValue(jsonObject) {
    return (jsonObject != null &&
        typeof jsonObject === 'object' &&
        jsonObject.type === 'json');
}
function defaultValueFromVariable(node) {
    throw new Error("Variable nodes are not supported by valueFromNode");
}
/**
 * Evaluate a ValueNode and yield its value in its natural JS form.
 */
function valueFromNode(node, onVariable) {
    if (onVariable === void 0) { onVariable = defaultValueFromVariable; }
    switch (node.kind) {
        case 'Variable':
            return onVariable(node);
        case 'NullValue':
            return null;
        case 'IntValue':
            return parseInt(node.value);
        case 'FloatValue':
            return parseFloat(node.value);
        case 'ListValue':
            return node.values.map(function (v) { return valueFromNode(v, onVariable); });
        case 'ObjectValue': {
            var value = {};
            for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
                var field = _a[_i];
                value[field.name.value] = valueFromNode(field.value, onVariable);
            }
            return value;
        }
        default:
            return node.value;
    }
}

function getDirectiveInfoFromField(field, variables) {
    if (field.directives && field.directives.length) {
        var directiveObj_1 = {};
        field.directives.forEach(function (directive) {
            directiveObj_1[directive.name.value] = argumentsObjectFromField(directive, variables);
        });
        return directiveObj_1;
    }
    return null;
}
function shouldInclude(selection, variables) {
    if (variables === void 0) { variables = {}; }
    if (!selection.directives) {
        return true;
    }
    var res = true;
    selection.directives.forEach(function (directive) {
        // TODO should move this validation to GraphQL validation once that's implemented.
        if (directive.name.value !== 'skip' && directive.name.value !== 'include') {
            // Just don't worry about directives we don't understand
            return;
        }
        //evaluate the "if" argument and skip (i.e. return undefined) if it evaluates to true.
        var directiveArguments = directive.arguments || [];
        var directiveName = directive.name.value;
        if (directiveArguments.length !== 1) {
            throw new Error("Incorrect number of arguments for the @" + directiveName + " directive.");
        }
        var ifArgument = directiveArguments[0];
        if (!ifArgument.name || ifArgument.name.value !== 'if') {
            throw new Error("Invalid argument for the @" + directiveName + " directive.");
        }
        var ifValue = directiveArguments[0].value;
        var evaledValue = false;
        if (!ifValue || ifValue.kind !== 'BooleanValue') {
            // means it has to be a variable value if this is a valid @skip or @include directive
            if (ifValue.kind !== 'Variable') {
                throw new Error("Argument for the @" + directiveName + " directive must be a variable or a boolean value.");
            }
            else {
                evaledValue = variables[ifValue.name.value];
                if (evaledValue === undefined) {
                    throw new Error("Invalid variable referenced in @" + directiveName + " directive.");
                }
            }
        }
        else {
            evaledValue = ifValue.value;
        }
        if (directiveName === 'skip') {
            evaledValue = !evaledValue;
        }
        if (!evaledValue) {
            res = false;
        }
    });
    return res;
}
function flattenSelections(selection) {
    if (!selection.selectionSet ||
        !(selection.selectionSet.selections.length > 0))
        return [selection];
    return [selection].concat(selection.selectionSet.selections
        .map(function (selectionNode) {
        return [selectionNode].concat(flattenSelections(selectionNode));
    })
        .reduce(function (selections, selected) { return selections.concat(selected); }, []));
}
var added = new Map();
function getDirectiveNames(doc) {
    var cached = added.get(doc);
    if (cached)
        return cached;
    // operation => [names of directives];
    var directives = doc.definitions
        .filter(function (definition) {
        return definition.selectionSet && definition.selectionSet.selections;
    })
        .map(function (x) { return flattenSelections(x); })
        .reduce(function (selections, selected) { return selections.concat(selected); }, [])
        .filter(function (selection) {
        return selection.directives && selection.directives.length > 0;
    })
        .map(function (selection) { return selection.directives; })
        .reduce(function (directives, directive) { return directives.concat(directive); }, [])
        .map(function (directive) { return directive.name.value; });
    added.set(doc, directives);
    return directives;
}
function hasDirectives(names, doc) {
    return getDirectiveNames(doc).some(function (name) { return names.indexOf(name) > -1; });
}

var __assign$2 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Returns a query document which adds a single query operation that only
 * spreads the target fragment inside of it.
 *
 * So for example a document of:
 *
 * ```graphql
 * fragment foo on Foo { a b c }
 * ```
 *
 * Turns into:
 *
 * ```graphql
 * { ...foo }
 *
 * fragment foo on Foo { a b c }
 * ```
 *
 * The target fragment will either be the only fragment in the document, or a
 * fragment specified by the provided `fragmentName`. If there is more then one
 * fragment, but a `fragmentName` was not defined then an error will be thrown.
 */
function getFragmentQueryDocument(document, fragmentName) {
    var actualFragmentName = fragmentName;
    // Build an array of all our fragment definitions that will be used for
    // validations. We also do some validations on the other definitions in the
    // document while building this list.
    var fragments = [];
    document.definitions.forEach(function (definition) {
        // Throw an error if we encounter an operation definition because we will
        // define our own operation definition later on.
        if (definition.kind === 'OperationDefinition') {
            throw new Error("Found a " + definition.operation + " operation" + (definition.name ? " named '" + definition.name.value + "'" : '') + ". " +
                'No operations are allowed when using a fragment as a query. Only fragments are allowed.');
        }
        // Add our definition to the fragments array if it is a fragment
        // definition.
        if (definition.kind === 'FragmentDefinition') {
            fragments.push(definition);
        }
    });
    // If the user did not give us a fragment name then let us try to get a
    // name from a single fragment in the definition.
    if (typeof actualFragmentName === 'undefined') {
        if (fragments.length !== 1) {
            throw new Error("Found " + fragments.length + " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.");
        }
        actualFragmentName = fragments[0].name.value;
    }
    // Generate a query document with an operation that simply spreads the
    // fragment inside of it.
    var query = __assign$2({}, document, { definitions: [
            {
                kind: 'OperationDefinition',
                operation: 'query',
                selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                        {
                            kind: 'FragmentSpread',
                            name: {
                                kind: 'Name',
                                value: actualFragmentName,
                            },
                        },
                    ],
                },
            }
        ].concat(document.definitions) });
    return query;
}

function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
        if (typeof source === 'undefined' || source === null) {
            return;
        }
        Object.keys(source).forEach(function (key) {
            target[key] = source[key];
        });
    });
    return target;
}

function getMutationDefinition(doc) {
    checkDocument(doc);
    var mutationDef = doc.definitions.filter(function (definition) {
        return definition.kind === 'OperationDefinition' &&
            definition.operation === 'mutation';
    })[0];
    if (!mutationDef) {
        throw new Error('Must contain a mutation definition.');
    }
    return mutationDef;
}
// Checks the document for errors and throws an exception if there is an error.
function checkDocument(doc) {
    if (doc.kind !== 'Document') {
        throw new Error("Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    }
    var operations = doc.definitions
        .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
        .map(function (definition) {
        if (definition.kind !== 'OperationDefinition') {
            throw new Error("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
        }
        return definition;
    });
    if (operations.length > 1) {
        throw new Error("Ambiguous GraphQL document: contains " + operations.length + " operations");
    }
}
function getOperationDefinition(doc) {
    checkDocument(doc);
    return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
}
function getOperationDefinitionOrDie(document) {
    var def = getOperationDefinition(document);
    if (!def) {
        throw new Error("GraphQL document is missing an operation");
    }
    return def;
}
function getOperationName(doc) {
    return (doc.definitions
        .filter(function (definition) {
        return definition.kind === 'OperationDefinition' && definition.name;
    })
        .map(function (x) { return x.name.value; })[0] || null);
}
// Returns the FragmentDefinitions from a particular document as an array
function getFragmentDefinitions(doc) {
    return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
}
function getQueryDefinition(doc) {
    var queryDef = getOperationDefinition(doc);
    if (!queryDef || queryDef.operation !== 'query') {
        throw new Error('Must contain a query definition.');
    }
    return queryDef;
}
function getFragmentDefinition(doc) {
    if (doc.kind !== 'Document') {
        throw new Error("Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    }
    if (doc.definitions.length > 1) {
        throw new Error('Fragment must have exactly one definition.');
    }
    var fragmentDef = doc.definitions[0];
    if (fragmentDef.kind !== 'FragmentDefinition') {
        throw new Error('Must be a fragment definition.');
    }
    return fragmentDef;
}
/**
 * Returns the first operation definition found in this document.
 * If no operation definition is found, the first fragment definition will be returned.
 * If no definitions are found, an error will be thrown.
 */
function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === 'OperationDefinition') {
            var operation = definition.operation;
            if (operation === 'query' ||
                operation === 'mutation' ||
                operation === 'subscription') {
                return definition;
            }
        }
        if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
            // we do this because we want to allow multiple fragment definitions
            // to precede an operation definition.
            fragmentDefinition = definition;
        }
    }
    if (fragmentDefinition) {
        return fragmentDefinition;
    }
    throw new Error('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
}
// Utility function that takes a list of fragment definitions and makes a hash out of them
// that maps the name of the fragment to the fragment definition.
function createFragmentMap(fragments) {
    if (fragments === void 0) { fragments = []; }
    var symTable = {};
    fragments.forEach(function (fragment) {
        symTable[fragment.name.value] = fragment;
    });
    return symTable;
}
function getDefaultValues(definition) {
    if (definition &&
        definition.variableDefinitions &&
        definition.variableDefinitions.length) {
        var defaultValues = definition.variableDefinitions
            .filter(function (_a) {
            var defaultValue = _a.defaultValue;
            return defaultValue;
        })
            .map(function (_a) {
            var variable = _a.variable, defaultValue = _a.defaultValue;
            var defaultValueObj = {};
            valueToObjectRepresentation(defaultValueObj, variable.name, defaultValue);
            return defaultValueObj;
        });
        return assign.apply(void 0, [{}].concat(defaultValues));
    }
    return {};
}
/**
 * Returns the names of all variables declared by the operation.
 */
function variablesInOperation(operation) {
    var names = new Set();
    if (operation.variableDefinitions) {
        for (var _i = 0, _a = operation.variableDefinitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            names.add(definition.variable.name.value);
        }
    }
    return names;
}

/**
 * Deeply clones a value to create a new instance.
 */
function cloneDeep(value) {
    // If the value is an array, create a new array where every item has been cloned.
    if (Array.isArray(value)) {
        return value.map(function (item) { return cloneDeep(item); });
    }
    // If the value is an object, go through all of the object’s properties and add them to a new
    // object.
    if (value !== null && typeof value === 'object') {
        var nextValue = {};
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                nextValue[key] = cloneDeep(value[key]);
            }
        }
        return nextValue;
    }
    // Otherwise this is some primitive value and it is therefore immutable so we can just return it
    // directly.
    return value;
}

var TYPENAME_FIELD = {
    kind: 'Field',
    name: {
        kind: 'Name',
        value: '__typename',
    },
};
function isNotEmpty(op, fragments) {
    // keep selections that are still valid
    return (op.selectionSet.selections.filter(function (selectionSet) {
        // anything that doesn't match the compound filter is okay
        return !(selectionSet &&
            // look into fragments to verify they should stay
            selectionSet.kind === 'FragmentSpread' &&
            // see if the fragment in the map is valid (recursively)
            !isNotEmpty(fragments[selectionSet.name.value], fragments));
    }).length > 0);
}
function getDirectiveMatcher(directives) {
    return function directiveMatcher(directive) {
        return directives.some(function (dir) {
            if (dir.name && dir.name === directive.name.value)
                return true;
            if (dir.test && dir.test(directive))
                return true;
            return false;
        });
    };
}
function addTypenameToSelectionSet(selectionSet, isRoot) {
    if (isRoot === void 0) { isRoot = false; }
    if (selectionSet.selections) {
        if (!isRoot) {
            var alreadyHasThisField = selectionSet.selections.some(function (selection) {
                return (selection.kind === 'Field' &&
                    selection.name.value === '__typename');
            });
            if (!alreadyHasThisField) {
                selectionSet.selections.push(TYPENAME_FIELD);
            }
        }
        selectionSet.selections.forEach(function (selection) {
            // Must not add __typename if we're inside an introspection query
            if (selection.kind === 'Field') {
                if (selection.name.value.lastIndexOf('__', 0) !== 0 &&
                    selection.selectionSet) {
                    addTypenameToSelectionSet(selection.selectionSet);
                }
            }
            else if (selection.kind === 'InlineFragment') {
                if (selection.selectionSet) {
                    addTypenameToSelectionSet(selection.selectionSet);
                }
            }
        });
    }
}
function removeDirectivesFromSelectionSet(directives, selectionSet) {
    if (!selectionSet.selections)
        return selectionSet;
    // if any of the directives are set to remove this selectionSet, remove it
    var agressiveRemove = directives.some(function (dir) { return dir.remove; });
    selectionSet.selections = selectionSet.selections
        .map(function (selection) {
        if (selection.kind !== 'Field' ||
            !selection ||
            !selection.directives)
            return selection;
        var directiveMatcher = getDirectiveMatcher(directives);
        var remove;
        selection.directives = selection.directives.filter(function (directive) {
            var shouldKeep = !directiveMatcher(directive);
            if (!remove && !shouldKeep && agressiveRemove)
                remove = true;
            return shouldKeep;
        });
        return remove ? null : selection;
    })
        .filter(function (x) { return !!x; });
    selectionSet.selections.forEach(function (selection) {
        if ((selection.kind === 'Field' || selection.kind === 'InlineFragment') &&
            selection.selectionSet) {
            removeDirectivesFromSelectionSet(directives, selection.selectionSet);
        }
    });
    return selectionSet;
}
function removeDirectivesFromDocument(directives, doc) {
    var docClone = cloneDeep(doc);
    docClone.definitions.forEach(function (definition) {
        removeDirectivesFromSelectionSet(directives, definition.selectionSet);
    });
    var operation = getOperationDefinitionOrDie(docClone);
    var fragments = createFragmentMap(getFragmentDefinitions(docClone));
    return isNotEmpty(operation, fragments) ? docClone : null;
}
var added$1 = new Map();
function addTypenameToDocument(doc) {
    checkDocument(doc);
    var cached = added$1.get(doc);
    if (cached)
        return cached;
    var docClone = cloneDeep(doc);
    docClone.definitions.forEach(function (definition) {
        var isRoot = definition.kind === 'OperationDefinition';
        addTypenameToSelectionSet(definition.selectionSet, isRoot);
    });
    added$1.set(doc, docClone);
    return docClone;
}
var connectionRemoveConfig = {
    test: function (directive) {
        var willRemove = directive.name.value === 'connection';
        if (willRemove) {
            if (!directive.arguments ||
                !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
                console.warn('Removing an @connection directive even though it does not have a key. ' +
                    'You may want to use the key parameter to specify a store key.');
            }
        }
        return willRemove;
    },
};
var removed = new Map();
function removeConnectionDirectiveFromDocument(doc) {
    checkDocument(doc);
    var cached = removed.get(doc);
    if (cached)
        return cached;
    var docClone = removeDirectivesFromDocument([connectionRemoveConfig], doc);
    removed.set(doc, docClone);
    return docClone;
}
function hasDirectivesInSelectionSet(directives, selectionSet, nestedCheck) {
    if (nestedCheck === void 0) { nestedCheck = true; }
    if (!(selectionSet && selectionSet.selections)) {
        return false;
    }
    var matchedSelections = selectionSet.selections.filter(function (selection) {
        return hasDirectivesInSelection(directives, selection, nestedCheck);
    });
    return matchedSelections.length > 0;
}
function hasDirectivesInSelection(directives, selection, nestedCheck) {
    if (nestedCheck === void 0) { nestedCheck = true; }
    if (selection.kind !== 'Field' || !selection) {
        return true;
    }
    if (!selection.directives) {
        return false;
    }
    var directiveMatcher = getDirectiveMatcher(directives);
    var matchedDirectives = selection.directives.filter(directiveMatcher);
    return (matchedDirectives.length > 0 ||
        (nestedCheck &&
            hasDirectivesInSelectionSet(directives, selection.selectionSet, nestedCheck)));
}
function getDirectivesFromSelectionSet(directives, selectionSet) {
    selectionSet.selections = selectionSet.selections
        .filter(function (selection) {
        return hasDirectivesInSelection(directives, selection, true);
    })
        .map(function (selection) {
        if (hasDirectivesInSelection(directives, selection, false)) {
            return selection;
        }
        if ((selection.kind === 'Field' || selection.kind === 'InlineFragment') &&
            selection.selectionSet) {
            selection.selectionSet = getDirectivesFromSelectionSet(directives, selection.selectionSet);
        }
        return selection;
    });
    return selectionSet;
}
function getDirectivesFromDocument(directives, doc, includeAllFragments) {
    if (includeAllFragments === void 0) { includeAllFragments = false; }
    checkDocument(doc);
    var docClone = cloneDeep(doc);
    docClone.definitions = docClone.definitions.map(function (definition) {
        if ((definition.kind === 'OperationDefinition' ||
            (definition.kind === 'FragmentDefinition' && !includeAllFragments)) &&
            definition.selectionSet) {
            definition.selectionSet = getDirectivesFromSelectionSet(directives, definition.selectionSet);
        }
        return definition;
    });
    var operation = getOperationDefinitionOrDie(docClone);
    var fragments = createFragmentMap(getFragmentDefinitions(docClone));
    return isNotEmpty(operation, fragments) ? docClone : null;
}

function getEnv() {
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
        return process.env.NODE_ENV;
    }
    // default environment
    return 'development';
}
function isEnv(env) {
    return getEnv() === env;
}
function isProduction() {
    return isEnv('production') === true;
}
function isDevelopment() {
    return isEnv('development') === true;
}
function isTest() {
    return isEnv('test') === true;
}

function tryFunctionOrLogError(f) {
    try {
        return f();
    }
    catch (e) {
        if (console.error) {
            console.error(e);
        }
    }
}
function graphQLResultHasError(result) {
    return result.errors && result.errors.length;
}

/**
 * Performs a deep equality check on two JavaScript values.
 */
function isEqual(a, b) {
    // If the two values are strictly equal, we are good.
    if (a === b) {
        return true;
    }
    // Dates are equivalent if their time values are equal.
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    // If a and b are both objects, we will compare their properties. This will compare arrays as
    // well.
    if (a != null &&
        typeof a === 'object' &&
        b != null &&
        typeof b === 'object') {
        // Compare all of the keys in `a`. If one of the keys has a different value, or that key does
        // not exist in `b` return false immediately.
        for (var key in a) {
            if (Object.prototype.hasOwnProperty.call(a, key)) {
                if (!Object.prototype.hasOwnProperty.call(b, key)) {
                    return false;
                }
                if (!isEqual(a[key], b[key])) {
                    return false;
                }
            }
        }
        // Look through all the keys in `b`. If `b` has a key that `a` does not, return false.
        for (var key in b) {
            if (!Object.prototype.hasOwnProperty.call(a, key)) {
                return false;
            }
        }
        // If we made it this far the objects are equal!
        return true;
    }
    // Otherwise the values are not equal.
    return false;
}

// taken straight from https://github.com/substack/deep-freeze to avoid import hassles with rollup
function deepFreeze(o) {
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (o.hasOwnProperty(prop) &&
            o[prop] !== null &&
            (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
            !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
}
function maybeDeepFreeze(obj) {
    if (isDevelopment() || isTest()) {
        // Polyfilled Symbols potentially cause infinite / very deep recursion while deep freezing
        // which is known to crash IE11 (https://github.com/apollographql/apollo-client/issues/3043).
        var symbolIsPolyfilled = typeof Symbol === 'function' && typeof Symbol('') === 'string';
        if (!symbolIsPolyfilled) {
            return deepFreeze(obj);
        }
    }
    return obj;
}

var haveWarned = Object.create({});
/**
 * Print a warning only once in development.
 * In production no warnings are printed.
 * In test all warnings are printed.
 *
 * @param msg The warning message
 * @param type warn or error (will call console.warn or console.error)
 */
function warnOnceInDevelopment(msg, type) {
    if (type === void 0) { type = 'warn'; }
    if (isProduction()) {
        return;
    }
    if (!haveWarned[msg]) {
        if (!isTest()) {
            haveWarned[msg] = true;
        }
        switch (type) {
            case 'error':
                console.error(msg);
                break;
            default:
                console.warn(msg);
        }
    }
}



var lib$1 = Object.freeze({
	getDirectiveInfoFromField: getDirectiveInfoFromField,
	shouldInclude: shouldInclude,
	flattenSelections: flattenSelections,
	getDirectiveNames: getDirectiveNames,
	hasDirectives: hasDirectives,
	getFragmentQueryDocument: getFragmentQueryDocument,
	getMutationDefinition: getMutationDefinition,
	checkDocument: checkDocument,
	getOperationDefinition: getOperationDefinition,
	getOperationDefinitionOrDie: getOperationDefinitionOrDie,
	getOperationName: getOperationName,
	getFragmentDefinitions: getFragmentDefinitions,
	getQueryDefinition: getQueryDefinition,
	getFragmentDefinition: getFragmentDefinition,
	getMainDefinition: getMainDefinition,
	createFragmentMap: createFragmentMap,
	getDefaultValues: getDefaultValues,
	variablesInOperation: variablesInOperation,
	removeDirectivesFromDocument: removeDirectivesFromDocument,
	addTypenameToDocument: addTypenameToDocument,
	removeConnectionDirectiveFromDocument: removeConnectionDirectiveFromDocument,
	getDirectivesFromDocument: getDirectivesFromDocument,
	isScalarValue: isScalarValue,
	isNumberValue: isNumberValue,
	valueToObjectRepresentation: valueToObjectRepresentation,
	storeKeyNameFromField: storeKeyNameFromField,
	getStoreKeyName: getStoreKeyName,
	argumentsObjectFromField: argumentsObjectFromField,
	resultKeyNameFromField: resultKeyNameFromField,
	isField: isField,
	isInlineFragment: isInlineFragment,
	isIdValue: isIdValue,
	toIdValue: toIdValue,
	isJsonValue: isJsonValue,
	valueFromNode: valueFromNode,
	assign: assign,
	cloneDeep: cloneDeep,
	getEnv: getEnv,
	isEnv: isEnv,
	isProduction: isProduction,
	isDevelopment: isDevelopment,
	isTest: isTest,
	tryFunctionOrLogError: tryFunctionOrLogError,
	graphQLResultHasError: graphQLResultHasError,
	isEqual: isEqual,
	maybeDeepFreeze: maybeDeepFreeze,
	warnOnceInDevelopment: warnOnceInDevelopment
});

/**
 * The current status of a query’s execution in our system.
 */
var NetworkStatus;
(function (NetworkStatus) {
    /**
     * The query has never been run before and the query is now currently running. A query will still
     * have this network status even if a partial data result was returned from the cache, but a
     * query was dispatched anyway.
     */
    NetworkStatus[NetworkStatus["loading"] = 1] = "loading";
    /**
     * If `setVariables` was called and a query was fired because of that then the network status
     * will be `setVariables` until the result of that query comes back.
     */
    NetworkStatus[NetworkStatus["setVariables"] = 2] = "setVariables";
    /**
     * Indicates that `fetchMore` was called on this query and that the query created is currently in
     * flight.
     */
    NetworkStatus[NetworkStatus["fetchMore"] = 3] = "fetchMore";
    /**
     * Similar to the `setVariables` network status. It means that `refetch` was called on a query
     * and the refetch request is currently in flight.
     */
    NetworkStatus[NetworkStatus["refetch"] = 4] = "refetch";
    /**
     * Indicates that a polling query is currently in flight. So for example if you are polling a
     * query every 10 seconds then the network status will switch to `poll` every 10 seconds whenever
     * a poll request has been sent but not resolved.
     */
    NetworkStatus[NetworkStatus["poll"] = 6] = "poll";
    /**
     * No request is in flight for this query, and no errors happened. Everything is OK.
     */
    NetworkStatus[NetworkStatus["ready"] = 7] = "ready";
    /**
     * No request is in flight for this query, but one or more errors were detected.
     */
    NetworkStatus[NetworkStatus["error"] = 8] = "error";
})(NetworkStatus || (NetworkStatus = {}));
/**
 * Returns true if there is currently a network request in flight according to a given network
 * status.
 */
function isNetworkRequestInFlight(networkStatus) {
    return networkStatus < 7;
}

var Observable_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// === Symbol Support ===

var hasSymbols = function () {
  return typeof Symbol === 'function';
};
var hasSymbol = function (name) {
  return hasSymbols() && Boolean(Symbol[name]);
};
var getSymbol = function (name) {
  return hasSymbol(name) ? Symbol[name] : '@@' + name;
};

if (hasSymbols() && !hasSymbol('observable')) {
  Symbol.observable = Symbol('observable');
}

// === Abstract Operations ===

function getMethod(obj, key) {
  var value = obj[key];

  if (value == null) return undefined;

  if (typeof value !== 'function') throw new TypeError(value + ' is not a function');

  return value;
}

function getSpecies(obj) {
  var ctor = obj.constructor;
  if (ctor !== undefined) {
    ctor = ctor[getSymbol('species')];
    if (ctor === null) {
      ctor = undefined;
    }
  }
  return ctor !== undefined ? ctor : Observable;
}

function isObservable(x) {
  return x instanceof Observable; // SPEC: Brand check
}

function hostReportError(e) {
  if (hostReportError.log) {
    hostReportError.log(e);
  } else {
    setTimeout(function () {
      throw e;
    });
  }
}

function enqueue(fn) {
  Promise.resolve().then(function () {
    try {
      fn();
    } catch (e) {
      hostReportError(e);
    }
  });
}

function cleanupSubscription(subscription) {
  var cleanup = subscription._cleanup;
  if (cleanup === undefined) return;

  subscription._cleanup = undefined;

  if (!cleanup) {
    return;
  }

  try {
    if (typeof cleanup === 'function') {
      cleanup();
    } else {
      var unsubscribe = getMethod(cleanup, 'unsubscribe');
      if (unsubscribe) {
        unsubscribe.call(cleanup);
      }
    }
  } catch (e) {
    hostReportError(e);
  }
}

function closeSubscription(subscription) {
  subscription._observer = undefined;
  subscription._queue = undefined;
  subscription._state = 'closed';
}

function flushSubscription(subscription) {
  var queue = subscription._queue;
  if (!queue) {
    return;
  }
  subscription._queue = undefined;
  subscription._state = 'ready';
  for (var i = 0; i < queue.length; ++i) {
    notifySubscription(subscription, queue[i].type, queue[i].value);
    if (subscription._state === 'closed') break;
  }
}

function notifySubscription(subscription, type, value) {
  subscription._state = 'running';

  var observer = subscription._observer;

  try {
    var m = getMethod(observer, type);
    switch (type) {
      case 'next':
        if (m) m.call(observer, value);
        break;
      case 'error':
        closeSubscription(subscription);
        if (m) m.call(observer, value);else throw value;
        break;
      case 'complete':
        closeSubscription(subscription);
        if (m) m.call(observer);
        break;
    }
  } catch (e) {
    hostReportError(e);
  }

  if (subscription._state === 'closed') cleanupSubscription(subscription);else if (subscription._state === 'running') subscription._state = 'ready';
}

function onNotify(subscription, type, value) {
  if (subscription._state === 'closed') return;

  if (subscription._state === 'buffering') {
    subscription._queue.push({ type: type, value: value });
    return;
  }

  if (subscription._state !== 'ready') {
    subscription._state = 'buffering';
    subscription._queue = [{ type: type, value: value }];
    enqueue(function () {
      return flushSubscription(subscription);
    });
    return;
  }

  notifySubscription(subscription, type, value);
}

var Subscription = function () {
  function Subscription(observer, subscriber) {
    _classCallCheck(this, Subscription);

    // ASSERT: observer is an object
    // ASSERT: subscriber is callable

    this._cleanup = undefined;
    this._observer = observer;
    this._queue = undefined;
    this._state = 'initializing';

    var subscriptionObserver = new SubscriptionObserver(this);

    try {
      this._cleanup = subscriber.call(undefined, subscriptionObserver);
    } catch (e) {
      subscriptionObserver.error(e);
    }

    if (this._state === 'initializing') this._state = 'ready';
  }

  _createClass(Subscription, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      if (this._state !== 'closed') {
        closeSubscription(this);
        cleanupSubscription(this);
      }
    }
  }, {
    key: 'closed',
    get: function () {
      return this._state === 'closed';
    }
  }]);

  return Subscription;
}();

var SubscriptionObserver = function () {
  function SubscriptionObserver(subscription) {
    _classCallCheck(this, SubscriptionObserver);

    this._subscription = subscription;
  }

  _createClass(SubscriptionObserver, [{
    key: 'next',
    value: function next(value) {
      onNotify(this._subscription, 'next', value);
    }
  }, {
    key: 'error',
    value: function error(value) {
      onNotify(this._subscription, 'error', value);
    }
  }, {
    key: 'complete',
    value: function complete() {
      onNotify(this._subscription, 'complete');
    }
  }, {
    key: 'closed',
    get: function () {
      return this._subscription._state === 'closed';
    }
  }]);

  return SubscriptionObserver;
}();

var Observable = exports.Observable = function () {
  function Observable(subscriber) {
    _classCallCheck(this, Observable);

    if (!(this instanceof Observable)) throw new TypeError('Observable cannot be called as a function');

    if (typeof subscriber !== 'function') throw new TypeError('Observable initializer must be a function');

    this._subscriber = subscriber;
  }

  _createClass(Observable, [{
    key: 'subscribe',
    value: function subscribe(observer) {
      if (typeof observer !== 'object' || observer === null) {
        observer = {
          next: observer,
          error: arguments[1],
          complete: arguments[2]
        };
      }
      return new Subscription(observer, this._subscriber);
    }
  }, {
    key: 'forEach',
    value: function forEach(fn) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (typeof fn !== 'function') {
          reject(new TypeError(fn + ' is not a function'));
          return;
        }

        function done() {
          subscription.unsubscribe();
          resolve();
        }

        var subscription = _this.subscribe({
          next: function (value) {
            try {
              fn(value, done);
            } catch (e) {
              reject(e);
              subscription.unsubscribe();
            }
          },

          error: reject,
          complete: resolve
        });
      });
    }
  }, {
    key: 'map',
    value: function map(fn) {
      var _this2 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

      var C = getSpecies(this);

      return new C(function (observer) {
        return _this2.subscribe({
          next: function (value) {
            try {
              value = fn(value);
            } catch (e) {
              return observer.error(e);
            }
            observer.next(value);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            observer.complete();
          }
        });
      });
    }
  }, {
    key: 'filter',
    value: function filter(fn) {
      var _this3 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

      var C = getSpecies(this);

      return new C(function (observer) {
        return _this3.subscribe({
          next: function (value) {
            try {
              if (!fn(value)) return;
            } catch (e) {
              return observer.error(e);
            }
            observer.next(value);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            observer.complete();
          }
        });
      });
    }
  }, {
    key: 'reduce',
    value: function reduce(fn) {
      var _this4 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

      var C = getSpecies(this);
      var hasSeed = arguments.length > 1;
      var hasValue = false;
      var seed = arguments[1];
      var acc = seed;

      return new C(function (observer) {
        return _this4.subscribe({
          next: function (value) {
            var first = !hasValue;
            hasValue = true;

            if (!first || hasSeed) {
              try {
                acc = fn(acc, value);
              } catch (e) {
                return observer.error(e);
              }
            } else {
              acc = value;
            }
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            if (!hasValue && !hasSeed) return observer.error(new TypeError('Cannot reduce an empty sequence'));

            observer.next(acc);
            observer.complete();
          }
        });
      });
    }
  }, {
    key: 'concat',
    value: function concat() {
      var _this5 = this;

      for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }

      var C = getSpecies(this);

      return new C(function (observer) {
        var subscription = void 0;

        function startNext(next) {
          subscription = next.subscribe({
            next: function (v) {
              observer.next(v);
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              if (sources.length === 0) {
                subscription = undefined;
                observer.complete();
              } else {
                startNext(C.from(sources.shift()));
              }
            }
          });
        }

        startNext(_this5);

        return function () {
          if (subscription) {
            subscription = undefined;
            subscription.unsubscribe();
          }
        };
      });
    }
  }, {
    key: 'flatMap',
    value: function flatMap(fn) {
      var _this6 = this;

      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

      var C = getSpecies(this);

      return new C(function (observer) {
        var subscriptions = [];

        var outer = _this6.subscribe({
          next: function (value) {
            if (fn) {
              try {
                value = fn(value);
              } catch (e) {
                return observer.error(e);
              }
            }

            var inner = C.from(value).subscribe({
              next: function (value) {
                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                var i = subscriptions.indexOf(inner);
                if (i >= 0) subscriptions.splice(i, 1);
                completeIfDone();
              }
            });

            subscriptions.push(inner);
          },
          error: function (e) {
            observer.error(e);
          },
          complete: function () {
            completeIfDone();
          }
        });

        function completeIfDone() {
          if (outer.closed && subscriptions.length === 0) observer.complete();
        }

        return function () {
          subscriptions.forEach(function (s) {
            return s.unsubscribe();
          });
          outer.unsubscribe();
        };
      });
    }
  }, {
    key: getSymbol('observable'),
    value: function () {
      return this;
    }
  }], [{
    key: 'from',
    value: function from(x) {
      var C = typeof this === 'function' ? this : Observable;

      if (x == null) throw new TypeError(x + ' is not an object');

      var method = getMethod(x, getSymbol('observable'));
      if (method) {
        var observable = method.call(x);

        if (Object(observable) !== observable) throw new TypeError(observable + ' is not an object');

        if (isObservable(observable) && observable.constructor === C) return observable;

        return new C(function (observer) {
          return observable.subscribe(observer);
        });
      }

      if (hasSymbol('iterator')) {
        method = getMethod(x, getSymbol('iterator'));
        if (method) {
          return new C(function (observer) {
            enqueue(function () {
              if (observer.closed) return;
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = method.call(x)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var item = _step.value;

                  observer.next(item);
                  if (observer.closed) return;
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }

              observer.complete();
            });
          });
        }
      }

      if (Array.isArray(x)) {
        return new C(function (observer) {
          enqueue(function () {
            if (observer.closed) return;
            for (var i = 0; i < x.length; ++i) {
              observer.next(x[i]);
              if (observer.closed) return;
            }
            observer.complete();
          });
        });
      }

      throw new TypeError(x + ' is not observable');
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }

      var C = typeof this === 'function' ? this : Observable;

      return new C(function (observer) {
        enqueue(function () {
          if (observer.closed) return;
          for (var i = 0; i < items.length; ++i) {
            observer.next(items[i]);
            if (observer.closed) return;
          }
          observer.complete();
        });
      });
    }
  }, {
    key: getSymbol('species'),
    get: function () {
      return this;
    }
  }]);

  return Observable;
}();

if (hasSymbols()) {
  Object.defineProperty(Observable, Symbol('extensions'), {
    value: {
      symbol: getSymbol('observable'),
      hostReportError: hostReportError
    },
    configurabe: true
  });
}
});

unwrapExports(Observable_1);

var zenObservable$1 = Observable_1.Observable;

var Observable$2 = zenObservable$1;

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$3 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function validateOperation(operation) {
    var OPERATION_FIELDS = [
        'query',
        'operationName',
        'variables',
        'extensions',
        'context',
    ];
    for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
        var key = _a[_i];
        if (OPERATION_FIELDS.indexOf(key) < 0) {
            throw new Error("illegal argument: " + key);
        }
    }
    return operation;
}
var LinkError = /** @class */ (function (_super) {
    __extends$2(LinkError, _super);
    function LinkError(message, link) {
        var _this = _super.call(this, message) || this;
        _this.link = link;
        return _this;
    }
    return LinkError;
}(Error));
function isTerminating(link) {
    return link.request.length <= 1;
}
function toPromise(observable) {
    var completed = false;
    return new Promise(function (resolve, reject) {
        observable.subscribe({
            next: function (data) {
                if (completed) {
                    console.warn("Promise Wrapper does not support multiple results from Observable");
                }
                else {
                    completed = true;
                    resolve(data);
                }
            },
            error: reject,
        });
    });
}
// backwards compat
var makePromise = toPromise;
function fromPromise(promise) {
    return new Observable$2(function (observer) {
        promise
            .then(function (value) {
            observer.next(value);
            observer.complete();
        })
            .catch(observer.error.bind(observer));
    });
}
function fromError(errorValue) {
    return new Observable$2(function (observer) {
        observer.error(errorValue);
    });
}
function transformOperation(operation) {
    var transformedOperation = {
        variables: operation.variables || {},
        extensions: operation.extensions || {},
        operationName: operation.operationName,
        query: operation.query,
    };
    // best guess at an operation name
    if (!transformedOperation.operationName) {
        transformedOperation.operationName =
            typeof transformedOperation.query !== 'string'
                ? getOperationName(transformedOperation.query)
                : '';
    }
    return transformedOperation;
}
function createOperation(starting, operation) {
    var context = __assign$3({}, starting);
    var setContext = function (next) {
        if (typeof next === 'function') {
            context = __assign$3({}, context, next(context));
        }
        else {
            context = __assign$3({}, context, next);
        }
    };
    var getContext = function () { return (__assign$3({}, context)); };
    Object.defineProperty(operation, 'setContext', {
        enumerable: false,
        value: setContext,
    });
    Object.defineProperty(operation, 'getContext', {
        enumerable: false,
        value: getContext,
    });
    Object.defineProperty(operation, 'toKey', {
        enumerable: false,
        value: function () { return getKey(operation); },
    });
    return operation;
}
function getKey(operation) {
    // XXX we're assuming here that variables will be serialized in the same order.
    // that might not always be true
    return printer_1(operation.query) + "|" + JSON.stringify(operation.variables) + "|" + operation.operationName;
}

var passthrough = function (op, forward) { return (forward ? forward(op) : Observable$2.of()); };
var toLink = function (handler) {
    return typeof handler === 'function' ? new ApolloLink(handler) : handler;
};
var empty = function () {
    return new ApolloLink(function (op, forward) { return Observable$2.of(); });
};
var from = function (links) {
    if (links.length === 0)
        return empty();
    return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
};
var split = function (test, left, right) {
    if (right === void 0) { right = new ApolloLink(passthrough); }
    var leftLink = toLink(left);
    var rightLink = toLink(right);
    if (isTerminating(leftLink) && isTerminating(rightLink)) {
        return new ApolloLink(function (operation) {
            return test(operation)
                ? leftLink.request(operation) || Observable$2.of()
                : rightLink.request(operation) || Observable$2.of();
        });
    }
    else {
        return new ApolloLink(function (operation, forward) {
            return test(operation)
                ? leftLink.request(operation, forward) || Observable$2.of()
                : rightLink.request(operation, forward) || Observable$2.of();
        });
    }
};
// join two Links together
var concat = function (first, second) {
    var firstLink = toLink(first);
    if (isTerminating(firstLink)) {
        console.warn(new LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
        return firstLink;
    }
    var nextLink = toLink(second);
    if (isTerminating(nextLink)) {
        return new ApolloLink(function (operation) {
            return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable$2.of(); }) || Observable$2.of();
        });
    }
    else {
        return new ApolloLink(function (operation, forward) {
            return (firstLink.request(operation, function (op) {
                return nextLink.request(op, forward) || Observable$2.of();
            }) || Observable$2.of());
        });
    }
};
var ApolloLink = /** @class */ (function () {
    function ApolloLink(request) {
        if (request)
            this.request = request;
    }
    ApolloLink.prototype.split = function (test, left, right) {
        if (right === void 0) { right = new ApolloLink(passthrough); }
        return this.concat(split(test, left, right));
    };
    ApolloLink.prototype.concat = function (next) {
        return concat(this, next);
    };
    ApolloLink.prototype.request = function (operation, forward) {
        throw new Error('request is not implemented');
    };
    ApolloLink.empty = empty;
    ApolloLink.from = from;
    ApolloLink.split = split;
    ApolloLink.execute = execute;
    return ApolloLink;
}());
function execute(link, operation) {
    return (link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || Observable$2.of());
}



var lib$2 = Object.freeze({
	Observable: Observable$2,
	createOperation: createOperation,
	makePromise: makePromise,
	toPromise: toPromise,
	fromPromise: fromPromise,
	fromError: fromError,
	empty: empty,
	from: from,
	split: split,
	concat: concat,
	ApolloLink: ApolloLink,
	execute: execute
});

function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
}

/* global window */
var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = symbolObservablePonyfill(root);

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// This simplified polyfill attempts to follow the ECMAScript Observable proposal.
// See https://github.com/zenparsing/es-observable
// rxjs interopt
var Observable$$1 = (function (_super) {
    __extends$1(Observable$$1, _super);
    function Observable$$1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Observable$$1.prototype[result] = function () {
        return this;
    };
    return Observable$$1;
}(Observable$2));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function isApolloError(err) {
    return err.hasOwnProperty('graphQLErrors');
}
// Sets the error message on this error according to the
// the GraphQL and network errors that are present.
// If the error message has already been set through the
// constructor or otherwise, this function is a nop.
var generateErrorMessage = function (err) {
    var message = '';
    // If we have GraphQL errors present, add that to the error message.
    if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length !== 0) {
        err.graphQLErrors.forEach(function (graphQLError) {
            var errorMessage = graphQLError
                ? graphQLError.message
                : 'Error message not found.';
            message += "GraphQL error: " + errorMessage + "\n";
        });
    }
    if (err.networkError) {
        message += 'Network error: ' + err.networkError.message + '\n';
    }
    // strip newline from the end of the message
    message = message.replace(/\n$/, '');
    return message;
};
var ApolloError = (function (_super) {
    __extends$3(ApolloError, _super);
    // Constructs an instance of ApolloError given a GraphQLError
    // or a network error. Note that one of these has to be a valid
    // value or the constructed error will be meaningless.
    function ApolloError(_a) {
        var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError, errorMessage = _a.errorMessage, extraInfo = _a.extraInfo;
        var _this = _super.call(this, errorMessage) || this;
        _this.graphQLErrors = graphQLErrors || [];
        _this.networkError = networkError || null;
        if (!errorMessage) {
            _this.message = generateErrorMessage(_this);
        }
        else {
            _this.message = errorMessage;
        }
        _this.extraInfo = extraInfo;
        Object.setPrototypeOf(_this, ApolloError.prototype);
        return _this;
    }
    return ApolloError;
}(Error));

var FetchType;
(function (FetchType) {
    FetchType[FetchType["normal"] = 1] = "normal";
    FetchType[FetchType["refetch"] = 2] = "refetch";
    FetchType[FetchType["poll"] = 3] = "poll";
})(FetchType || (FetchType = {}));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var hasError = function (storeValue, policy) {
    if (policy === void 0) { policy = 'none'; }
    return storeValue &&
        ((storeValue.graphQLErrors &&
            storeValue.graphQLErrors.length > 0 &&
            policy === 'none') ||
            storeValue.networkError);
};
var ObservableQuery = (function (_super) {
    __extends(ObservableQuery, _super);
    function ObservableQuery(_a) {
        var scheduler = _a.scheduler, options = _a.options, _b = _a.shouldSubscribe, shouldSubscribe = _b === void 0 ? true : _b;
        var _this = _super.call(this, function (observer) {
            return _this.onSubscribe(observer);
        }) || this;
        // active state
        _this.isCurrentlyPolling = false;
        _this.isTornDown = false;
        // query information
        _this.options = options;
        _this.variables = options.variables || {};
        _this.queryId = scheduler.queryManager.generateQueryId();
        _this.shouldSubscribe = shouldSubscribe;
        // related classes
        _this.scheduler = scheduler;
        _this.queryManager = scheduler.queryManager;
        // interal data stores
        _this.observers = [];
        _this.subscriptionHandles = [];
        return _this;
    }
    ObservableQuery.prototype.result = function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            var subscription;
            var observer = {
                next: function (result) {
                    resolve(result);
                    // Stop the query within the QueryManager if we can before
                    // this function returns.
                    //
                    // We do this in order to prevent observers piling up within
                    // the QueryManager. Notice that we only fully unsubscribe
                    // from the subscription in a setTimeout(..., 0)  call. This call can
                    // actually be handled by the browser at a much later time. If queries
                    // are fired in the meantime, observers that should have been removed
                    // from the QueryManager will continue to fire, causing an unnecessary
                    // performance hit.
                    if (!that.observers.some(function (obs) { return obs !== observer; })) {
                        that.queryManager.removeQuery(that.queryId);
                    }
                    setTimeout(function () {
                        subscription.unsubscribe();
                    }, 0);
                },
                error: function (error) {
                    reject(error);
                },
            };
            subscription = that.subscribe(observer);
        });
    };
    /**
     * Return the result of the query from the local cache as well as some fetching status
     * `loading` and `networkStatus` allow to know if a request is in flight
     * `partial` lets you know if the result from the local cache is complete or partial
     * @return {result: Object, loading: boolean, networkStatus: number, partial: boolean}
     */
    ObservableQuery.prototype.currentResult = function () {
        if (this.isTornDown) {
            return {
                data: this.lastError ? {} : this.lastResult ? this.lastResult.data : {},
                error: this.lastError,
                loading: false,
                networkStatus: NetworkStatus.error,
            };
        }
        var queryStoreValue = this.queryManager.queryStore.get(this.queryId);
        if (hasError(queryStoreValue, this.options.errorPolicy)) {
            return {
                data: {},
                loading: false,
                networkStatus: queryStoreValue.networkStatus,
                error: new ApolloError({
                    graphQLErrors: queryStoreValue.graphQLErrors,
                    networkError: queryStoreValue.networkError,
                }),
            };
        }
        var _a = this.queryManager.getCurrentQueryResult(this), data = _a.data, partial = _a.partial;
        var queryLoading = !queryStoreValue ||
            queryStoreValue.networkStatus === NetworkStatus.loading;
        // We need to be careful about the loading state we show to the user, to try
        // and be vaguely in line with what the user would have seen from .subscribe()
        // but to still provide useful information synchronously when the query
        // will not end up hitting the server.
        // See more: https://github.com/apollostack/apollo-client/issues/707
        // Basically: is there a query in flight right now (modolo the next tick)?
        var loading = (this.options.fetchPolicy === 'network-only' && queryLoading) ||
            (partial && this.options.fetchPolicy !== 'cache-only');
        // if there is nothing in the query store, it means this query hasn't fired yet or it has been cleaned up. Therefore the
        // network status is dependent on queryLoading.
        var networkStatus;
        if (queryStoreValue) {
            networkStatus = queryStoreValue.networkStatus;
        }
        else {
            networkStatus = loading ? NetworkStatus.loading : NetworkStatus.ready;
        }
        var result = {
            data: data,
            loading: isNetworkRequestInFlight(networkStatus),
            networkStatus: networkStatus,
        };
        if (queryStoreValue &&
            queryStoreValue.graphQLErrors &&
            this.options.errorPolicy === 'all') {
            result.errors = queryStoreValue.graphQLErrors;
        }
        if (!partial) {
            var stale = false;
            this.lastResult = __assign({}, result, { stale: stale });
        }
        return __assign({}, result, { partial: partial });
    };
    // Returns the last result that observer.next was called with. This is not the same as
    // currentResult! If you're not sure which you need, then you probably need currentResult.
    ObservableQuery.prototype.getLastResult = function () {
        return this.lastResult;
    };
    ObservableQuery.prototype.getLastError = function () {
        return this.lastError;
    };
    ObservableQuery.prototype.resetLastResults = function () {
        delete this.lastResult;
        delete this.lastError;
        this.isTornDown = false;
    };
    ObservableQuery.prototype.refetch = function (variables) {
        var fetchPolicy = this.options.fetchPolicy;
        // early return if trying to read from cache during refetch
        if (fetchPolicy === 'cache-only') {
            return Promise.reject(new Error('cache-only fetchPolicy option should not be used together with query refetch.'));
        }
        if (!isEqual(this.variables, variables)) {
            // update observable variables
            this.variables = __assign({}, this.variables, variables);
        }
        if (!isEqual(this.options.variables, this.variables)) {
            // Update the existing options with new variables
            this.options.variables = __assign({}, this.options.variables, this.variables);
        }
        // Override fetchPolicy for this call only
        // only network-only and no-cache are safe to use
        var isNetworkFetchPolicy = fetchPolicy === 'network-only' || fetchPolicy === 'no-cache';
        var combinedOptions = __assign({}, this.options, { fetchPolicy: isNetworkFetchPolicy ? fetchPolicy : 'network-only' });
        return this.queryManager
            .fetchQuery(this.queryId, combinedOptions, FetchType.refetch)
            .then(function (result) { return maybeDeepFreeze(result); });
    };
    ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
        var _this = this;
        // early return if no update Query
        if (!fetchMoreOptions.updateQuery) {
            throw new Error('updateQuery option is required. This function defines how to update the query data with the new results.');
        }
        return Promise.resolve()
            .then(function () {
            var qid = _this.queryManager.generateQueryId();
            var combinedOptions;
            if (fetchMoreOptions.query) {
                // fetch a new query
                combinedOptions = fetchMoreOptions;
            }
            else {
                // fetch the same query with a possibly new variables
                combinedOptions = __assign({}, _this.options, fetchMoreOptions, { variables: __assign({}, _this.variables, fetchMoreOptions.variables) });
            }
            combinedOptions.fetchPolicy = 'network-only';
            return _this.queryManager.fetchQuery(qid, combinedOptions, FetchType.normal, _this.queryId);
        })
            .then(function (fetchMoreResult) {
            _this.updateQuery(function (previousResult, _a) {
                var variables = _a.variables;
                return fetchMoreOptions.updateQuery(previousResult, {
                    fetchMoreResult: fetchMoreResult.data,
                    variables: variables,
                });
            });
            return fetchMoreResult;
        });
    };
    // XXX the subscription variables are separate from the query variables.
    // if you want to update subscription variables, right now you have to do that separately,
    // and you can only do it by stopping the subscription and then subscribing again with new variables.
    ObservableQuery.prototype.subscribeToMore = function (options) {
        var _this = this;
        var subscription = this.queryManager
            .startGraphQLSubscription({
            query: options.document,
            variables: options.variables,
        })
            .subscribe({
            next: function (data) {
                if (options.updateQuery) {
                    _this.updateQuery(function (previous, _a) {
                        var variables = _a.variables;
                        return options.updateQuery(previous, {
                            subscriptionData: data,
                            variables: variables,
                        });
                    });
                }
            },
            error: function (err) {
                if (options.onError) {
                    options.onError(err);
                    return;
                }
                console.error('Unhandled GraphQL subscription error', err);
            },
        });
        this.subscriptionHandles.push(subscription);
        return function () {
            var i = _this.subscriptionHandles.indexOf(subscription);
            if (i >= 0) {
                _this.subscriptionHandles.splice(i, 1);
                subscription.unsubscribe();
            }
        };
    };
    // Note: if the query is not active (there are no subscribers), the promise
    // will return null immediately.
    ObservableQuery.prototype.setOptions = function (opts) {
        var oldOptions = this.options;
        this.options = __assign({}, this.options, opts);
        if (opts.pollInterval) {
            this.startPolling(opts.pollInterval);
        }
        else if (opts.pollInterval === 0) {
            this.stopPolling();
        }
        // If fetchPolicy went from cache-only to something else, or from something else to network-only
        var tryFetch = (oldOptions.fetchPolicy !== 'network-only' &&
            opts.fetchPolicy === 'network-only') ||
            (oldOptions.fetchPolicy === 'cache-only' &&
                opts.fetchPolicy !== 'cache-only') ||
            (oldOptions.fetchPolicy === 'standby' &&
                opts.fetchPolicy !== 'standby') ||
            false;
        return this.setVariables(this.options.variables, tryFetch, opts.fetchResults);
    };
    /**
     * Update the variables of this observable query, and fetch the new results
     * if they've changed. If you want to force new results, use `refetch`.
     *
     * Note: if the variables have not changed, the promise will return the old
     * results immediately, and the `next` callback will *not* fire.
     *
     * Note: if the query is not active (there are no subscribers), the promise
     * will return null immediately.
     *
     * @param variables: The new set of variables. If there are missing variables,
     * the previous values of those variables will be used.
     *
     * @param tryFetch: Try and fetch new results even if the variables haven't
     * changed (we may still just hit the store, but if there's nothing in there
     * this will refetch)
     *
     * @param fetchResults: Option to ignore fetching results when updating variables
     *
     */
    ObservableQuery.prototype.setVariables = function (variables, tryFetch, fetchResults) {
        if (tryFetch === void 0) { tryFetch = false; }
        if (fetchResults === void 0) { fetchResults = true; }
        // since setVariables restarts the subscription, we reset the tornDown status
        this.isTornDown = false;
        var newVariables = variables ? variables : this.variables;
        if (isEqual(newVariables, this.variables) && !tryFetch) {
            // If we have no observers, then we don't actually want to make a network
            // request. As soon as someone observes the query, the request will kick
            // off. For now, we just store any changes. (See #1077)
            if (this.observers.length === 0 || !fetchResults) {
                return new Promise(function (resolve) { return resolve(); });
            }
            return this.result();
        }
        else {
            this.lastVariables = this.variables;
            this.variables = newVariables;
            this.options.variables = newVariables;
            // See comment above
            if (this.observers.length === 0) {
                return new Promise(function (resolve) { return resolve(); });
            }
            // Use the same options as before, but with new variables
            return this.queryManager
                .fetchQuery(this.queryId, __assign({}, this.options, { variables: this.variables }))
                .then(function (result) { return maybeDeepFreeze(result); });
        }
    };
    ObservableQuery.prototype.updateQuery = function (mapFn) {
        var _a = this.queryManager.getQueryWithPreviousResult(this.queryId), previousResult = _a.previousResult, variables = _a.variables, document = _a.document;
        var newResult = tryFunctionOrLogError(function () {
            return mapFn(previousResult, { variables: variables });
        });
        if (newResult) {
            this.queryManager.dataStore.markUpdateQueryResult(document, variables, newResult);
            this.queryManager.broadcastQueries();
        }
    };
    ObservableQuery.prototype.stopPolling = function () {
        if (this.isCurrentlyPolling) {
            this.scheduler.stopPollingQuery(this.queryId);
            this.options.pollInterval = undefined;
            this.isCurrentlyPolling = false;
        }
    };
    ObservableQuery.prototype.startPolling = function (pollInterval) {
        if (this.options.fetchPolicy === 'cache-first' ||
            this.options.fetchPolicy === 'cache-only') {
            throw new Error('Queries that specify the cache-first and cache-only fetchPolicies cannot also be polling queries.');
        }
        if (this.isCurrentlyPolling) {
            this.scheduler.stopPollingQuery(this.queryId);
            this.isCurrentlyPolling = false;
        }
        this.options.pollInterval = pollInterval;
        this.isCurrentlyPolling = true;
        this.scheduler.startPollingQuery(this.options, this.queryId);
    };
    ObservableQuery.prototype.onSubscribe = function (observer) {
        var _this = this;
        // Zen Observable has its own error function, in order to log correctly
        // we need to declare a custom error if nothing is passed
        if (observer._subscription &&
            observer._subscription._observer &&
            !observer._subscription._observer.error) {
            observer._subscription._observer.error = function (error) {
                console.error('Unhandled error', error.message, error.stack);
            };
        }
        this.observers.push(observer);
        // Deliver initial result
        if (observer.next && this.lastResult)
            observer.next(this.lastResult);
        if (observer.error && this.lastError)
            observer.error(this.lastError);
        // setup the query if it hasn't been done before
        if (this.observers.length === 1)
            this.setUpQuery();
        return function () {
            _this.observers = _this.observers.filter(function (obs) { return obs !== observer; });
            if (_this.observers.length === 0) {
                _this.tearDownQuery();
            }
        };
    };
    ObservableQuery.prototype.setUpQuery = function () {
        var _this = this;
        if (this.shouldSubscribe) {
            this.queryManager.addObservableQuery(this.queryId, this);
        }
        if (!!this.options.pollInterval) {
            if (this.options.fetchPolicy === 'cache-first' ||
                this.options.fetchPolicy === 'cache-only') {
                throw new Error('Queries that specify the cache-first and cache-only fetchPolicies cannot also be polling queries.');
            }
            this.isCurrentlyPolling = true;
            this.scheduler.startPollingQuery(this.options, this.queryId);
        }
        var observer = {
            next: function (result) {
                _this.lastResult = result;
                _this.observers.forEach(function (obs) { return obs.next && obs.next(result); });
            },
            error: function (error) {
                _this.lastError = error;
                _this.observers.forEach(function (obs) { return obs.error && obs.error(error); });
            },
        };
        this.queryManager.startQuery(this.queryId, this.options, this.queryManager.queryListenerForObserver(this.queryId, this.options, observer));
    };
    ObservableQuery.prototype.tearDownQuery = function () {
        this.isTornDown = true;
        if (this.isCurrentlyPolling) {
            this.scheduler.stopPollingQuery(this.queryId);
            this.isCurrentlyPolling = false;
        }
        // stop all active GraphQL subscriptions
        this.subscriptionHandles.forEach(function (sub) { return sub.unsubscribe(); });
        this.subscriptionHandles = [];
        this.queryManager.removeObservableQuery(this.queryId);
        this.queryManager.stopQuery(this.queryId);
        this.observers = [];
    };
    return ObservableQuery;
}(Observable$$1));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * Expects context to contain the forceFetch field if no dedup
 */
var DedupLink = /** @class */ (function (_super) {
    __extends$4(DedupLink, _super);
    function DedupLink() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inFlightRequestObservables = new Map();
        _this.subscribers = new Map();
        return _this;
    }
    DedupLink.prototype.request = function (operation, forward) {
        var _this = this;
        // sometimes we might not want to deduplicate a request, for example when we want to force fetch it.
        if (operation.getContext().forceFetch) {
            return forward(operation);
        }
        var key = operation.toKey();
        var cleanup = function (key) {
            _this.inFlightRequestObservables.delete(key);
            var prev = _this.subscribers.get(key);
            return prev;
        };
        if (!this.inFlightRequestObservables.get(key)) {
            // this is a new request, i.e. we haven't deduplicated it yet
            // call the next link
            var singleObserver_1 = forward(operation);
            var subscription_1;
            var sharedObserver = new Observable$2(function (observer) {
                // this will still be called by each subscriber regardless of
                // deduplication status
                var prev = _this.subscribers.get(key);
                if (!prev)
                    prev = { next: [], error: [], complete: [] };
                _this.subscribers.set(key, {
                    next: prev.next.concat([observer.next.bind(observer)]),
                    error: prev.error.concat([observer.error.bind(observer)]),
                    complete: prev.complete.concat([observer.complete.bind(observer)]),
                });
                if (!subscription_1) {
                    subscription_1 = singleObserver_1.subscribe({
                        next: function (result) {
                            var prev = cleanup(key);
                            _this.subscribers.delete(key);
                            if (prev) {
                                prev.next.forEach(function (next) { return next(result); });
                                prev.complete.forEach(function (complete) { return complete(); });
                            }
                        },
                        error: function (error) {
                            var prev = cleanup(key);
                            _this.subscribers.delete(key);
                            if (prev)
                                prev.error.forEach(function (err) { return err(error); });
                        },
                    });
                }
                return function () {
                    if (subscription_1)
                        subscription_1.unsubscribe();
                    _this.inFlightRequestObservables.delete(key);
                };
            });
            this.inFlightRequestObservables.set(key, sharedObserver);
        }
        // return shared Observable
        return this.inFlightRequestObservables.get(key);
    };
    return DedupLink;
}(ApolloLink));

// The QueryScheduler is supposed to be a mechanism that schedules polling queries such that
// they are clustered into the time slots of the QueryBatcher and are batched together. It
// also makes sure that for a given polling query, if one instance of the query is inflight,
// another instance will not be fired until the query returns or times out. We do this because
// another query fires while one is already in flight, the data will stay in the "loading" state
// even after the first query has returned.
var __assign$6 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var QueryScheduler = (function () {
    function QueryScheduler(_a) {
        var queryManager = _a.queryManager, ssrMode = _a.ssrMode;
        // Map going from queryIds to query options that are in flight.
        this.inFlightQueries = {};
        // Map going from query ids to the query options associated with those queries. Contains all of
        // the queries, both in flight and not in flight.
        this.registeredQueries = {};
        // Map going from polling interval with to the query ids that fire on that interval.
        // These query ids are associated with a set of options in the this.registeredQueries.
        this.intervalQueries = {};
        // Map going from polling interval widths to polling timers.
        this.pollingTimers = {};
        this.ssrMode = false;
        this.queryManager = queryManager;
        this.ssrMode = ssrMode || false;
    }
    QueryScheduler.prototype.checkInFlight = function (queryId) {
        var query = this.queryManager.queryStore.get(queryId);
        return (query &&
            query.networkStatus !== NetworkStatus.ready &&
            query.networkStatus !== NetworkStatus.error);
    };
    QueryScheduler.prototype.fetchQuery = function (queryId, options, fetchType) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.queryManager
                .fetchQuery(queryId, options, fetchType)
                .then(function (result) {
                resolve(result);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    QueryScheduler.prototype.startPollingQuery = function (options, queryId, listener) {
        if (!options.pollInterval) {
            throw new Error('Attempted to start a polling query without a polling interval.');
        }
        // Do not poll in SSR mode
        if (this.ssrMode)
            return queryId;
        this.registeredQueries[queryId] = options;
        if (listener) {
            this.queryManager.addQueryListener(queryId, listener);
        }
        this.addQueryOnInterval(queryId, options);
        return queryId;
    };
    QueryScheduler.prototype.stopPollingQuery = function (queryId) {
        // Remove the query options from one of the registered queries.
        // The polling function will then take care of not firing it anymore.
        delete this.registeredQueries[queryId];
    };
    // Fires the all of the queries on a particular interval. Called on a setInterval.
    QueryScheduler.prototype.fetchQueriesOnInterval = function (interval) {
        var _this = this;
        // XXX this "filter" here is nasty, because it does two things at the same time.
        // 1. remove queries that have stopped polling
        // 2. call fetchQueries for queries that are polling and not in flight.
        // TODO: refactor this to make it cleaner
        this.intervalQueries[interval] = this.intervalQueries[interval].filter(function (queryId) {
            // If queryOptions can't be found from registeredQueries or if it has a
            // different interval, it means that this queryId is no longer registered
            // and should be removed from the list of queries firing on this interval.
            //
            // We don't remove queries from intervalQueries immediately in
            // stopPollingQuery so that we can keep the timer consistent when queries
            // are removed and replaced, and to avoid quadratic behavior when stopping
            // many queries.
            if (!(_this.registeredQueries.hasOwnProperty(queryId) &&
                _this.registeredQueries[queryId].pollInterval === interval)) {
                return false;
            }
            // Don't fire this instance of the polling query is one of the instances is already in
            // flight.
            if (_this.checkInFlight(queryId)) {
                return true;
            }
            var queryOptions = _this.registeredQueries[queryId];
            var pollingOptions = __assign$6({}, queryOptions);
            pollingOptions.fetchPolicy = 'network-only';
            // don't let unhandled rejections happen
            _this.fetchQuery(queryId, pollingOptions, FetchType.poll).catch(function () { });
            return true;
        });
        if (this.intervalQueries[interval].length === 0) {
            clearInterval(this.pollingTimers[interval]);
            delete this.intervalQueries[interval];
        }
    };
    // Adds a query on a particular interval to this.intervalQueries and then fires
    // that query with all the other queries executing on that interval. Note that the query id
    // and query options must have been added to this.registeredQueries before this function is called.
    QueryScheduler.prototype.addQueryOnInterval = function (queryId, queryOptions) {
        var _this = this;
        var interval = queryOptions.pollInterval;
        if (!interval) {
            throw new Error("A poll interval is required to start polling query with id '" + queryId + "'.");
        }
        // If there are other queries on this interval, this query will just fire with those
        // and we don't need to create a new timer.
        if (this.intervalQueries.hasOwnProperty(interval.toString()) &&
            this.intervalQueries[interval].length > 0) {
            this.intervalQueries[interval].push(queryId);
        }
        else {
            this.intervalQueries[interval] = [queryId];
            // set up the timer for the function that will handle this interval
            this.pollingTimers[interval] = setInterval(function () {
                _this.fetchQueriesOnInterval(interval);
            }, interval);
        }
    };
    // Used only for unit testing.
    QueryScheduler.prototype.registerPollingQuery = function (queryOptions) {
        if (!queryOptions.pollInterval) {
            throw new Error('Attempted to register a non-polling query with the scheduler.');
        }
        return new ObservableQuery({
            scheduler: this,
            options: queryOptions,
        });
    };
    return QueryScheduler;
}());

var MutationStore = (function () {
    function MutationStore() {
        this.store = {};
    }
    MutationStore.prototype.getStore = function () {
        return this.store;
    };
    MutationStore.prototype.get = function (mutationId) {
        return this.store[mutationId];
    };
    MutationStore.prototype.initMutation = function (mutationId, mutationString, variables) {
        this.store[mutationId] = {
            mutationString: mutationString,
            variables: variables || {},
            loading: true,
            error: null,
        };
    };
    MutationStore.prototype.markMutationError = function (mutationId, error) {
        var mutation = this.store[mutationId];
        if (!mutation) {
            return;
        }
        mutation.loading = false;
        mutation.error = error;
    };
    MutationStore.prototype.markMutationResult = function (mutationId) {
        var mutation = this.store[mutationId];
        if (!mutation) {
            return;
        }
        mutation.loading = false;
        mutation.error = null;
    };
    MutationStore.prototype.reset = function () {
        this.store = {};
    };
    return MutationStore;
}());

var __assign$7 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var QueryStore = (function () {
    function QueryStore() {
        this.store = {};
    }
    QueryStore.prototype.getStore = function () {
        return this.store;
    };
    QueryStore.prototype.get = function (queryId) {
        return this.store[queryId];
    };
    QueryStore.prototype.initQuery = function (query) {
        var previousQuery = this.store[query.queryId];
        if (previousQuery &&
            previousQuery.document !== query.document &&
            printer_1(previousQuery.document) !== printer_1(query.document)) {
            // XXX we're throwing an error here to catch bugs where a query gets overwritten by a new one.
            // we should implement a separate action for refetching so that QUERY_INIT may never overwrite
            // an existing query (see also: https://github.com/apollostack/apollo-client/issues/732)
            throw new Error('Internal Error: may not update existing query string in store');
        }
        var isSetVariables = false;
        var previousVariables = null;
        if (query.storePreviousVariables &&
            previousQuery &&
            previousQuery.networkStatus !== NetworkStatus.loading) {
            if (!isEqual(previousQuery.variables, query.variables)) {
                isSetVariables = true;
                previousVariables = previousQuery.variables;
            }
        }
        // TODO break this out into a separate function
        var networkStatus;
        if (isSetVariables) {
            networkStatus = NetworkStatus.setVariables;
        }
        else if (query.isPoll) {
            networkStatus = NetworkStatus.poll;
        }
        else if (query.isRefetch) {
            networkStatus = NetworkStatus.refetch;
            // TODO: can we determine setVariables here if it's a refetch and the variables have changed?
        }
        else {
            networkStatus = NetworkStatus.loading;
        }
        var graphQLErrors = [];
        if (previousQuery && previousQuery.graphQLErrors) {
            graphQLErrors = previousQuery.graphQLErrors;
        }
        // XXX right now if QUERY_INIT is fired twice, like in a refetch situation, we just overwrite
        // the store. We probably want a refetch action instead, because I suspect that if you refetch
        // before the initial fetch is done, you'll get an error.
        this.store[query.queryId] = {
            document: query.document,
            variables: query.variables,
            previousVariables: previousVariables,
            networkError: null,
            graphQLErrors: graphQLErrors,
            networkStatus: networkStatus,
            metadata: query.metadata,
        };
        // If the action had a `moreForQueryId` property then we need to set the
        // network status on that query as well to `fetchMore`.
        //
        // We have a complement to this if statement in the query result and query
        // error action branch, but importantly *not* in the client result branch.
        // This is because the implementation of `fetchMore` *always* sets
        // `fetchPolicy` to `network-only` so we would never have a client result.
        if (typeof query.fetchMoreForQueryId === 'string') {
            this.store[query.fetchMoreForQueryId].networkStatus =
                NetworkStatus.fetchMore;
        }
    };
    QueryStore.prototype.markQueryResult = function (queryId, result, fetchMoreForQueryId) {
        if (!this.store[queryId])
            return;
        this.store[queryId].networkError = null;
        this.store[queryId].graphQLErrors =
            result.errors && result.errors.length ? result.errors : [];
        this.store[queryId].previousVariables = null;
        this.store[queryId].networkStatus = NetworkStatus.ready;
        // If we have a `fetchMoreForQueryId` then we need to update the network
        // status for that query. See the branch for query initialization for more
        // explanation about this process.
        if (typeof fetchMoreForQueryId === 'string') {
            this.store[fetchMoreForQueryId].networkStatus = NetworkStatus.ready;
        }
    };
    QueryStore.prototype.markQueryError = function (queryId, error, fetchMoreForQueryId) {
        if (!this.store[queryId])
            return;
        this.store[queryId].networkError = error;
        this.store[queryId].networkStatus = NetworkStatus.error;
        // If we have a `fetchMoreForQueryId` then we need to update the network
        // status for that query. See the branch for query initialization for more
        // explanation about this process.
        if (typeof fetchMoreForQueryId === 'string') {
            this.markQueryResultClient(fetchMoreForQueryId, true);
        }
    };
    QueryStore.prototype.markQueryResultClient = function (queryId, complete) {
        if (!this.store[queryId])
            return;
        this.store[queryId].networkError = null;
        this.store[queryId].previousVariables = null;
        this.store[queryId].networkStatus = complete
            ? NetworkStatus.ready
            : NetworkStatus.loading;
    };
    QueryStore.prototype.stopQuery = function (queryId) {
        delete this.store[queryId];
    };
    QueryStore.prototype.reset = function (observableQueryIds) {
        var _this = this;
        // keep only the queries with query ids that are associated with observables
        this.store = Object.keys(this.store)
            .filter(function (queryId) {
            return observableQueryIds.indexOf(queryId) > -1;
        })
            .reduce(function (res, key) {
            // XXX set loading to true so listeners don't trigger unless they want results with partial data
            res[key] = __assign$7({}, _this.store[key], { networkStatus: NetworkStatus.loading });
            return res;
        }, {});
    };
    return QueryStore;
}());

var __assign$5 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var defaultQueryInfo = {
    listeners: [],
    invalidated: false,
    document: null,
    newData: null,
    lastRequestId: null,
    observableQuery: null,
    subscriptions: [],
};
var QueryManager = (function () {
    function QueryManager(_a) {
        var link = _a.link, _b = _a.queryDeduplication, queryDeduplication = _b === void 0 ? false : _b, store = _a.store, _c = _a.onBroadcast, onBroadcast = _c === void 0 ? function () { return undefined; } : _c, _d = _a.ssrMode, ssrMode = _d === void 0 ? false : _d;
        this.mutationStore = new MutationStore();
        this.queryStore = new QueryStore();
        // let's not start at zero to avoid pain with bad checks
        this.idCounter = 1;
        // XXX merge with ObservableQuery but that needs to be expanded to support mutations and
        // subscriptions as well
        this.queries = new Map();
        // A map going from a requestId to a promise that has not yet been resolved. We use this to keep
        // track of queries that are inflight and reject them in case some
        // destabalizing action occurs (e.g. reset of the Apollo store).
        this.fetchQueryPromises = new Map();
        // A map going from the name of a query to an observer issued for it by watchQuery. This is
        // generally used to refetches for refetchQueries and to update mutation results through
        // updateQueries.
        this.queryIdsByName = {};
        this.link = link;
        this.deduplicator = ApolloLink.from([new DedupLink(), link]);
        this.queryDeduplication = queryDeduplication;
        this.dataStore = store;
        this.onBroadcast = onBroadcast;
        this.scheduler = new QueryScheduler({ queryManager: this, ssrMode: ssrMode });
    }
    QueryManager.prototype.mutate = function (_a) {
        var _this = this;
        var mutation = _a.mutation, variables = _a.variables, optimisticResponse = _a.optimisticResponse, updateQueriesByName = _a.updateQueries, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? [] : _b, updateWithProxyFn = _a.update, _c = _a.errorPolicy, errorPolicy = _c === void 0 ? 'none' : _c, fetchPolicy = _a.fetchPolicy, _d = _a.context, context = _d === void 0 ? {} : _d;
        if (!mutation) {
            throw new Error('mutation option is required. You must specify your GraphQL document in the mutation option.');
        }
        if (fetchPolicy && fetchPolicy !== 'no-cache') {
            throw new Error("fetchPolicy for mutations currently only supports the 'no-cache' policy");
        }
        var mutationId = this.generateQueryId();
        var cache = this.dataStore.getCache();
        (mutation = cache.transformDocument(mutation)),
            (variables = assign({}, getDefaultValues(getMutationDefinition(mutation)), variables));
        var mutationString = printer_1(mutation);
        this.setQuery(mutationId, function () { return ({ document: mutation }); });
        // Create a map of update queries by id to the query instead of by name.
        var generateUpdateQueriesInfo = function () {
            var ret = {};
            if (updateQueriesByName) {
                Object.keys(updateQueriesByName).forEach(function (queryName) {
                    return (_this.queryIdsByName[queryName] || []).forEach(function (queryId) {
                        ret[queryId] = {
                            updater: updateQueriesByName[queryName],
                            query: _this.queryStore.get(queryId),
                        };
                    });
                });
            }
            return ret;
        };
        this.mutationStore.initMutation(mutationId, mutationString, variables);
        this.dataStore.markMutationInit({
            mutationId: mutationId,
            document: mutation,
            variables: variables || {},
            updateQueries: generateUpdateQueriesInfo(),
            update: updateWithProxyFn,
            optimisticResponse: optimisticResponse,
        });
        this.broadcastQueries();
        return new Promise(function (resolve, reject) {
            var storeResult;
            var error;
            var operation = _this.buildOperationForLink(mutation, variables, __assign$5({}, context, { optimisticResponse: optimisticResponse }));
            execute(_this.link, operation).subscribe({
                next: function (result) {
                    if (graphQLResultHasError(result) && errorPolicy === 'none') {
                        error = new ApolloError({
                            graphQLErrors: result.errors,
                        });
                        return;
                    }
                    _this.mutationStore.markMutationResult(mutationId);
                    if (fetchPolicy !== 'no-cache') {
                        _this.dataStore.markMutationResult({
                            mutationId: mutationId,
                            result: result,
                            document: mutation,
                            variables: variables || {},
                            updateQueries: generateUpdateQueriesInfo(),
                            update: updateWithProxyFn,
                        });
                    }
                    storeResult = result;
                },
                error: function (err) {
                    _this.mutationStore.markMutationError(mutationId, err);
                    _this.dataStore.markMutationComplete({
                        mutationId: mutationId,
                        optimisticResponse: optimisticResponse,
                    });
                    _this.broadcastQueries();
                    _this.setQuery(mutationId, function () { return ({ document: undefined }); });
                    reject(new ApolloError({
                        networkError: err,
                    }));
                },
                complete: function () {
                    if (error) {
                        _this.mutationStore.markMutationError(mutationId, error);
                    }
                    _this.dataStore.markMutationComplete({
                        mutationId: mutationId,
                        optimisticResponse: optimisticResponse,
                    });
                    _this.broadcastQueries();
                    if (error) {
                        reject(error);
                        return;
                    }
                    // allow for conditional refetches
                    // XXX do we want to make this the only API one day?
                    if (typeof refetchQueries === 'function')
                        refetchQueries = refetchQueries(storeResult);
                    refetchQueries.forEach(function (refetchQuery) {
                        if (typeof refetchQuery === 'string') {
                            _this.refetchQueryByName(refetchQuery);
                            return;
                        }
                        _this.query({
                            query: refetchQuery.query,
                            variables: refetchQuery.variables,
                            fetchPolicy: 'network-only',
                        });
                    });
                    _this.setQuery(mutationId, function () { return ({ document: undefined }); });
                    if (errorPolicy === 'ignore' &&
                        storeResult &&
                        graphQLResultHasError(storeResult)) {
                        delete storeResult.errors;
                    }
                    resolve(storeResult);
                },
            });
        });
    };
    QueryManager.prototype.fetchQuery = function (queryId, options, fetchType, 
        // This allows us to track if this is a query spawned by a `fetchMore`
        // call for another query. We need this data to compute the `fetchMore`
        // network status for the query this is fetching for.
        fetchMoreForQueryId) {
        var _this = this;
        var _a = options.variables, variables = _a === void 0 ? {} : _a, _b = options.metadata, metadata = _b === void 0 ? null : _b, _c = options.fetchPolicy, fetchPolicy = _c === void 0 ? 'cache-first' : _c;
        var cache = this.dataStore.getCache();
        var query = cache.transformDocument(options.query);
        var storeResult;
        var needToFetch = fetchPolicy === 'network-only' || fetchPolicy === 'no-cache';
        // If this is not a force fetch, we want to diff the query against the
        // store before we fetch it from the network interface.
        // TODO we hit the cache even if the policy is network-first. This could be unnecessary if the network is up.
        if (fetchType !== FetchType.refetch &&
            fetchPolicy !== 'network-only' &&
            fetchPolicy !== 'no-cache') {
            var _d = this.dataStore.getCache().diff({
                query: query,
                variables: variables,
                returnPartialData: true,
                optimistic: false,
            }), complete = _d.complete, result = _d.result;
            // If we're in here, only fetch if we have missing fields
            needToFetch = !complete || fetchPolicy === 'cache-and-network';
            storeResult = result;
        }
        var shouldFetch = needToFetch && fetchPolicy !== 'cache-only' && fetchPolicy !== 'standby';
        // we need to check to see if this is an operation that uses the @live directive
        if (hasDirectives(['live'], query))
            shouldFetch = true;
        var requestId = this.generateRequestId();
        // set up a watcher to listen to cache updates
        var cancel = this.updateQueryWatch(queryId, query, options);
        // Initialize query in store with unique requestId
        this.setQuery(queryId, function () { return ({
            document: query,
            lastRequestId: requestId,
            invalidated: true,
            cancel: cancel,
        }); });
        this.invalidate(true, fetchMoreForQueryId);
        this.queryStore.initQuery({
            queryId: queryId,
            document: query,
            storePreviousVariables: shouldFetch,
            variables: variables,
            isPoll: fetchType === FetchType.poll,
            isRefetch: fetchType === FetchType.refetch,
            metadata: metadata,
            fetchMoreForQueryId: fetchMoreForQueryId,
        });
        this.broadcastQueries();
        // If there is no part of the query we need to fetch from the server (or,
        // fetchPolicy is cache-only), we just write the store result as the final result.
        var shouldDispatchClientResult = !shouldFetch || fetchPolicy === 'cache-and-network';
        if (shouldDispatchClientResult) {
            this.queryStore.markQueryResultClient(queryId, !shouldFetch);
            this.invalidate(true, queryId, fetchMoreForQueryId);
            this.broadcastQueries();
        }
        if (shouldFetch) {
            var networkResult = this.fetchRequest({
                requestId: requestId,
                queryId: queryId,
                document: query,
                options: options,
                fetchMoreForQueryId: fetchMoreForQueryId,
            }).catch(function (error) {
                // This is for the benefit of `refetch` promises, which currently don't get their errors
                // through the store like watchQuery observers do
                if (isApolloError(error)) {
                    throw error;
                }
                else {
                    var lastRequestId = _this.getQuery(queryId).lastRequestId;
                    if (requestId >= (lastRequestId || 1)) {
                        _this.queryStore.markQueryError(queryId, error, fetchMoreForQueryId);
                        _this.invalidate(true, queryId, fetchMoreForQueryId);
                        _this.broadcastQueries();
                    }
                    _this.removeFetchQueryPromise(requestId);
                    throw new ApolloError({ networkError: error });
                }
            });
            // we don't return the promise for cache-and-network since it is already
            // returned below from the cache
            if (fetchPolicy !== 'cache-and-network') {
                return networkResult;
            }
            else {
                // however we need to catch the error so it isn't unhandled in case of
                // network error
                networkResult.catch(function () { });
            }
        }
        // If we have no query to send to the server, we should return the result
        // found within the store.
        return Promise.resolve({ data: storeResult });
    };
    // Returns a query listener that will update the given observer based on the
    // results (or lack thereof) for a particular query.
    QueryManager.prototype.queryListenerForObserver = function (queryId, options, observer) {
        var _this = this;
        var previouslyHadError = false;
        return function (queryStoreValue, newData) {
            // we're going to take a look at the data, so the query is no longer invalidated
            _this.invalidate(false, queryId);
            // The query store value can be undefined in the event of a store
            // reset.
            if (!queryStoreValue)
                return;
            var observableQuery = _this.getQuery(queryId).observableQuery;
            var fetchPolicy = observableQuery
                ? observableQuery.options.fetchPolicy
                : options.fetchPolicy;
            // don't watch the store for queries on standby
            if (fetchPolicy === 'standby')
                return;
            var errorPolicy = observableQuery
                ? observableQuery.options.errorPolicy
                : options.errorPolicy;
            var lastResult = observableQuery
                ? observableQuery.getLastResult()
                : null;
            var lastError = observableQuery ? observableQuery.getLastError() : null;
            var shouldNotifyIfLoading = (!newData && queryStoreValue.previousVariables != null) ||
                fetchPolicy === 'cache-only' ||
                fetchPolicy === 'cache-and-network';
            // if this caused by a cache broadcast but the query is still in flight
            // don't notify the observer
            // if (
            //   isCacheBroadcast &&
            //   isNetworkRequestInFlight(queryStoreValue.networkStatus)
            // ) {
            //   shouldNotifyIfLoading = false;
            // }
            var networkStatusChanged = Boolean(lastResult &&
                queryStoreValue.networkStatus !== lastResult.networkStatus);
            var errorStatusChanged = errorPolicy &&
                (lastError && lastError.graphQLErrors) !==
                    queryStoreValue.graphQLErrors &&
                errorPolicy !== 'none';
            if (!isNetworkRequestInFlight(queryStoreValue.networkStatus) ||
                (networkStatusChanged && options.notifyOnNetworkStatusChange) ||
                shouldNotifyIfLoading) {
                // If we have either a GraphQL error or a network error, we create
                // an error and tell the observer about it.
                if (((!errorPolicy || errorPolicy === 'none') &&
                    queryStoreValue.graphQLErrors &&
                    queryStoreValue.graphQLErrors.length > 0) ||
                    queryStoreValue.networkError) {
                    var apolloError_1 = new ApolloError({
                        graphQLErrors: queryStoreValue.graphQLErrors,
                        networkError: queryStoreValue.networkError,
                    });
                    previouslyHadError = true;
                    if (observer.error) {
                        try {
                            observer.error(apolloError_1);
                        }
                        catch (e) {
                            // Throw error outside this control flow to avoid breaking Apollo's state
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                    }
                    else {
                        // Throw error outside this control flow to avoid breaking Apollo's state
                        setTimeout(function () {
                            throw apolloError_1;
                        }, 0);
                        if (!isProduction()) {
                            /* tslint:disable-next-line */
                            console.info('An unhandled error was thrown because no error handler is registered ' +
                                'for the query ' +
                                printer_1(queryStoreValue.document));
                        }
                    }
                    return;
                }
                try {
                    var data = void 0;
                    var isMissing = void 0;
                    if (newData) {
                        // clear out the latest new data, since we're now using it
                        _this.setQuery(queryId, function () { return ({ newData: null }); });
                        data = newData.result;
                        isMissing = !newData.complete ? !newData.complete : false;
                    }
                    else {
                        if (lastResult && lastResult.data && !errorStatusChanged) {
                            data = lastResult.data;
                            isMissing = false;
                        }
                        else {
                            var document_1 = _this.getQuery(queryId).document;
                            var readResult = _this.dataStore.getCache().diff({
                                query: document_1,
                                variables: queryStoreValue.previousVariables ||
                                    queryStoreValue.variables,
                                optimistic: true,
                            });
                            data = readResult.result;
                            isMissing = !readResult.complete;
                        }
                    }
                    var resultFromStore = void 0;
                    // If there is some data missing and the user has told us that they
                    // do not tolerate partial data then we want to return the previous
                    // result and mark it as stale.
                    if (isMissing && fetchPolicy !== 'cache-only') {
                        resultFromStore = {
                            data: lastResult && lastResult.data,
                            loading: isNetworkRequestInFlight(queryStoreValue.networkStatus),
                            networkStatus: queryStoreValue.networkStatus,
                            stale: true,
                        };
                    }
                    else {
                        resultFromStore = {
                            data: data,
                            loading: isNetworkRequestInFlight(queryStoreValue.networkStatus),
                            networkStatus: queryStoreValue.networkStatus,
                            stale: false,
                        };
                    }
                    // if the query wants updates on errors we need to add it to the result
                    if (errorPolicy === 'all' &&
                        queryStoreValue.graphQLErrors &&
                        queryStoreValue.graphQLErrors.length > 0) {
                        resultFromStore.errors = queryStoreValue.graphQLErrors;
                    }
                    if (observer.next) {
                        var isDifferentResult = !(lastResult &&
                            resultFromStore &&
                            lastResult.networkStatus === resultFromStore.networkStatus &&
                            lastResult.stale === resultFromStore.stale &&
                            // We can do a strict equality check here because we include a `previousResult`
                            // with `readQueryFromStore`. So if the results are the same they will be
                            // referentially equal.
                            lastResult.data === resultFromStore.data);
                        if (isDifferentResult || previouslyHadError) {
                            try {
                                observer.next(maybeDeepFreeze(resultFromStore));
                            }
                            catch (e) {
                                // Throw error outside this control flow to avoid breaking Apollo's state
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        }
                    }
                    previouslyHadError = false;
                }
                catch (error) {
                    previouslyHadError = true;
                    if (observer.error)
                        observer.error(new ApolloError({ networkError: error }));
                    return;
                }
            }
        };
    };
    // The shouldSubscribe option is a temporary fix that tells us whether watchQuery was called
    // directly (i.e. through ApolloClient) or through the query method within QueryManager.
    // Currently, the query method uses watchQuery in order to handle non-network errors correctly
    // but we don't want to keep track observables issued for the query method since those aren't
    // supposed to be refetched in the event of a store reset. Once we unify error handling for
    // network errors and non-network errors, the shouldSubscribe option will go away.
    QueryManager.prototype.watchQuery = function (options, shouldSubscribe) {
        if (shouldSubscribe === void 0) { shouldSubscribe = true; }
        if (options.fetchPolicy === 'standby') {
            throw new Error('client.watchQuery cannot be called with fetchPolicy set to "standby"');
        }
        // get errors synchronously
        var queryDefinition = getQueryDefinition(options.query);
        // assign variable default values if supplied
        if (queryDefinition.variableDefinitions &&
            queryDefinition.variableDefinitions.length) {
            var defaultValues = getDefaultValues(queryDefinition);
            options.variables = assign({}, defaultValues, options.variables);
        }
        if (typeof options.notifyOnNetworkStatusChange === 'undefined') {
            options.notifyOnNetworkStatusChange = false;
        }
        var transformedOptions = __assign$5({}, options);
        return new ObservableQuery({
            scheduler: this.scheduler,
            options: transformedOptions,
            shouldSubscribe: shouldSubscribe,
        });
    };
    QueryManager.prototype.query = function (options) {
        var _this = this;
        if (!options.query) {
            throw new Error('query option is required. You must specify your GraphQL document in the query option.');
        }
        if (options.query.kind !== 'Document') {
            throw new Error('You must wrap the query string in a "gql" tag.');
        }
        if (options.returnPartialData) {
            throw new Error('returnPartialData option only supported on watchQuery.');
        }
        if (options.pollInterval) {
            throw new Error('pollInterval option only supported on watchQuery.');
        }
        if (typeof options.notifyOnNetworkStatusChange !== 'undefined') {
            throw new Error('Cannot call "query" with "notifyOnNetworkStatusChange" option. Only "watchQuery" has that option.');
        }
        options.notifyOnNetworkStatusChange = false;
        var requestId = this.idCounter;
        return new Promise(function (resolve, reject) {
            _this.addFetchQueryPromise(requestId, resolve, reject);
            return _this.watchQuery(options, false)
                .result()
                .then(function (result) {
                _this.removeFetchQueryPromise(requestId);
                resolve(result);
            })
                .catch(function (error) {
                _this.removeFetchQueryPromise(requestId);
                reject(error);
            });
        });
    };
    QueryManager.prototype.generateQueryId = function () {
        var queryId = this.idCounter.toString();
        this.idCounter++;
        return queryId;
    };
    QueryManager.prototype.stopQueryInStore = function (queryId) {
        this.queryStore.stopQuery(queryId);
        this.invalidate(true, queryId);
        this.broadcastQueries();
    };
    QueryManager.prototype.addQueryListener = function (queryId, listener) {
        this.setQuery(queryId, function (_a) {
            var _b = _a.listeners, listeners = _b === void 0 ? [] : _b;
            return ({
                listeners: listeners.concat([listener]),
                invalidate: false,
            });
        });
    };
    QueryManager.prototype.updateQueryWatch = function (queryId, document, options) {
        var _this = this;
        var cancel = this.getQuery(queryId).cancel;
        if (cancel)
            cancel();
        var previousResult = function () {
            var previousResult = null;
            var observableQuery = _this.getQuery(queryId).observableQuery;
            if (observableQuery) {
                var lastResult = observableQuery.getLastResult();
                if (lastResult) {
                    previousResult = lastResult.data;
                }
            }
            return previousResult;
        };
        return this.dataStore.getCache().watch({
            query: document,
            variables: options.variables,
            optimistic: true,
            previousResult: previousResult,
            callback: function (newData) {
                _this.setQuery(queryId, function () { return ({ invalidated: true, newData: newData }); });
            },
        });
    };
    // Adds a promise to this.fetchQueryPromises for a given request ID.
    QueryManager.prototype.addFetchQueryPromise = function (requestId, resolve, reject) {
        this.fetchQueryPromises.set(requestId.toString(), {
            resolve: resolve,
            reject: reject,
        });
    };
    // Removes the promise in this.fetchQueryPromises for a particular request ID.
    QueryManager.prototype.removeFetchQueryPromise = function (requestId) {
        this.fetchQueryPromises.delete(requestId.toString());
    };
    // Adds an ObservableQuery to this.observableQueries and to this.observableQueriesByName.
    QueryManager.prototype.addObservableQuery = function (queryId, observableQuery) {
        this.setQuery(queryId, function () { return ({ observableQuery: observableQuery }); });
        // Insert the ObservableQuery into this.observableQueriesByName if the query has a name
        var queryDef = getQueryDefinition(observableQuery.options.query);
        if (queryDef.name && queryDef.name.value) {
            var queryName = queryDef.name.value;
            // XXX we may we want to warn the user about query name conflicts in the future
            this.queryIdsByName[queryName] = this.queryIdsByName[queryName] || [];
            this.queryIdsByName[queryName].push(observableQuery.queryId);
        }
    };
    QueryManager.prototype.removeObservableQuery = function (queryId) {
        var _a = this.getQuery(queryId), observableQuery = _a.observableQuery, cancel = _a.cancel;
        if (cancel)
            cancel();
        if (!observableQuery)
            return;
        var definition = getQueryDefinition(observableQuery.options.query);
        var queryName = definition.name ? definition.name.value : null;
        this.setQuery(queryId, function () { return ({ observableQuery: null }); });
        if (queryName) {
            this.queryIdsByName[queryName] = this.queryIdsByName[queryName].filter(function (val) {
                return !(observableQuery.queryId === val);
            });
        }
    };
    QueryManager.prototype.clearStore = function () {
        // Before we have sent the reset action to the store,
        // we can no longer rely on the results returned by in-flight
        // requests since these may depend on values that previously existed
        // in the data portion of the store. So, we cancel the promises and observers
        // that we have issued so far and not yet resolved (in the case of
        // queries).
        this.fetchQueryPromises.forEach(function (_a) {
            var reject = _a.reject;
            reject(new Error('Store reset while query was in flight(not completed in link chain)'));
        });
        var resetIds = [];
        this.queries.forEach(function (_a, queryId) {
            var observableQuery = _a.observableQuery;
            if (observableQuery)
                resetIds.push(queryId);
        });
        this.queryStore.reset(resetIds);
        this.mutationStore.reset();
        // begin removing data from the store
        var reset = this.dataStore.reset();
        return reset;
    };
    QueryManager.prototype.resetStore = function () {
        var _this = this;
        // Similarly, we have to have to refetch each of the queries currently being
        // observed. We refetch instead of error'ing on these since the assumption is that
        // resetting the store doesn't eliminate the need for the queries currently being
        // watched. If there is an existing query in flight when the store is reset,
        // the promise for it will be rejected and its results will not be written to the
        // store.
        return this.clearStore().then(function () {
            return _this.reFetchObservableQueries();
        });
    };
    QueryManager.prototype.getObservableQueryPromises = function (includeStandby) {
        var _this = this;
        var observableQueryPromises = [];
        this.queries.forEach(function (_a, queryId) {
            var observableQuery = _a.observableQuery;
            if (!observableQuery)
                return;
            var fetchPolicy = observableQuery.options.fetchPolicy;
            observableQuery.resetLastResults();
            if (fetchPolicy !== 'cache-only' &&
                (includeStandby || fetchPolicy !== 'standby')) {
                observableQueryPromises.push(observableQuery.refetch());
            }
            _this.setQuery(queryId, function () { return ({ newData: null }); });
            _this.invalidate(true, queryId);
        });
        return observableQueryPromises;
    };
    QueryManager.prototype.reFetchObservableQueries = function (includeStandby) {
        var observableQueryPromises = this.getObservableQueryPromises(includeStandby);
        this.broadcastQueries();
        return Promise.all(observableQueryPromises);
    };
    QueryManager.prototype.startQuery = function (queryId, options, listener) {
        this.addQueryListener(queryId, listener);
        this.fetchQuery(queryId, options)
            .catch(function () { return undefined; });
        return queryId;
    };
    QueryManager.prototype.startGraphQLSubscription = function (options) {
        var _this = this;
        var query = options.query;
        var cache = this.dataStore.getCache();
        var transformedDoc = cache.transformDocument(query);
        var variables = assign({}, getDefaultValues(getOperationDefinition(query)), options.variables);
        var sub;
        var observers = [];
        return new Observable$$1(function (observer) {
            observers.push(observer);
            // If this is the first observer, actually initiate the network subscription
            if (observers.length === 1) {
                var handler = {
                    next: function (result) {
                        _this.dataStore.markSubscriptionResult(result, transformedDoc, variables);
                        _this.broadcastQueries();
                        // It's slightly awkward that the data for subscriptions doesn't come from the store.
                        observers.forEach(function (obs) {
                            // XXX I'd prefer a different way to handle errors for subscriptions
                            if (obs.next)
                                obs.next(result);
                        });
                    },
                    error: function (error) {
                        observers.forEach(function (obs) {
                            if (obs.error)
                                obs.error(error);
                        });
                    },
                };
                // TODO: Should subscriptions also accept a `context` option to pass
                // through to links?
                var operation = _this.buildOperationForLink(transformedDoc, variables);
                sub = execute(_this.link, operation).subscribe(handler);
            }
            return function () {
                observers = observers.filter(function (obs) { return obs !== observer; });
                // If we removed the last observer, tear down the network subscription
                if (observers.length === 0 && sub) {
                    sub.unsubscribe();
                }
            };
        });
    };
    QueryManager.prototype.stopQuery = function (queryId) {
        this.stopQueryInStore(queryId);
        this.removeQuery(queryId);
    };
    QueryManager.prototype.removeQuery = function (queryId) {
        var subscriptions = this.getQuery(queryId).subscriptions;
        // teardown all links
        subscriptions.forEach(function (x) { return x.unsubscribe(); });
        this.queries.delete(queryId);
    };
    QueryManager.prototype.getCurrentQueryResult = function (observableQuery, optimistic) {
        if (optimistic === void 0) { optimistic = true; }
        var _a = observableQuery.options, variables = _a.variables, query = _a.query;
        var lastResult = observableQuery.getLastResult();
        var newData = this.getQuery(observableQuery.queryId).newData;
        // XXX test this
        if (newData) {
            return maybeDeepFreeze({ data: newData.result, partial: false });
        }
        else {
            try {
                // the query is brand new, so we read from the store to see if anything is there
                var data = this.dataStore.getCache().read({
                    query: query,
                    variables: variables,
                    previousResult: lastResult ? lastResult.data : undefined,
                    optimistic: optimistic,
                });
                return maybeDeepFreeze({ data: data, partial: false });
            }
            catch (e) {
                return maybeDeepFreeze({ data: {}, partial: true });
            }
        }
    };
    QueryManager.prototype.getQueryWithPreviousResult = function (queryIdOrObservable) {
        var observableQuery;
        if (typeof queryIdOrObservable === 'string') {
            var foundObserveableQuery = this.getQuery(queryIdOrObservable).observableQuery;
            if (!foundObserveableQuery) {
                throw new Error("ObservableQuery with this id doesn't exist: " + queryIdOrObservable);
            }
            observableQuery = foundObserveableQuery;
        }
        else {
            observableQuery = queryIdOrObservable;
        }
        var _a = observableQuery.options, variables = _a.variables, query = _a.query;
        var data = this.getCurrentQueryResult(observableQuery, false).data;
        return {
            previousResult: data,
            variables: variables,
            document: query,
        };
    };
    QueryManager.prototype.broadcastQueries = function () {
        var _this = this;
        this.onBroadcast();
        this.queries.forEach(function (info, id) {
            if (!info.invalidated || !info.listeners)
                return;
            info.listeners
                .filter(function (x) { return !!x; })
                .forEach(function (listener) {
                listener(_this.queryStore.get(id), info.newData);
            });
        });
    };
    // Takes a request id, query id, a query document and information associated with the query
    // and send it to the network interface. Returns
    // a promise for the result associated with that request.
    QueryManager.prototype.fetchRequest = function (_a) {
        var _this = this;
        var requestId = _a.requestId, queryId = _a.queryId, document = _a.document, options = _a.options, fetchMoreForQueryId = _a.fetchMoreForQueryId;
        var variables = options.variables, context = options.context, _b = options.errorPolicy, errorPolicy = _b === void 0 ? 'none' : _b, fetchPolicy = options.fetchPolicy;
        var operation = this.buildOperationForLink(document, variables, __assign$5({}, context, { 
            // TODO: Should this be included for all entry points via
            // buildOperationForLink?
            forceFetch: !this.queryDeduplication }));
        var resultFromStore;
        var errorsFromStore;
        return new Promise(function (resolve, reject) {
            _this.addFetchQueryPromise(requestId, resolve, reject);
            var subscription = execute(_this.deduplicator, operation).subscribe({
                next: function (result) {
                    // default the lastRequestId to 1
                    var lastRequestId = _this.getQuery(queryId).lastRequestId;
                    if (requestId >= (lastRequestId || 1)) {
                        if (fetchPolicy !== 'no-cache') {
                            try {
                                _this.dataStore.markQueryResult(result, document, variables, fetchMoreForQueryId, errorPolicy === 'ignore' || errorPolicy === 'all');
                            }
                            catch (e) {
                                reject(e);
                                return;
                            }
                        }
                        else {
                            _this.setQuery(queryId, function () { return ({
                                newData: { result: result.data, complete: true },
                            }); });
                        }
                        _this.queryStore.markQueryResult(queryId, result, fetchMoreForQueryId);
                        _this.invalidate(true, queryId, fetchMoreForQueryId);
                        _this.broadcastQueries();
                    }
                    if (result.errors && errorPolicy === 'none') {
                        reject(new ApolloError({
                            graphQLErrors: result.errors,
                        }));
                        return;
                    }
                    else if (errorPolicy === 'all') {
                        errorsFromStore = result.errors;
                    }
                    if (fetchMoreForQueryId || fetchPolicy === 'no-cache') {
                        // We don't write fetchMore results to the store because this would overwrite
                        // the original result in case an @connection directive is used.
                        resultFromStore = result.data;
                    }
                    else {
                        try {
                            // ensure result is combined with data already in store
                            resultFromStore = _this.dataStore.getCache().read({
                                variables: variables,
                                query: document,
                                optimistic: false,
                            });
                            // this will throw an error if there are missing fields in
                            // the results which can happen with errors from the server.
                            // tslint:disable-next-line
                        }
                        catch (e) { }
                    }
                },
                error: function (error) {
                    _this.removeFetchQueryPromise(requestId);
                    _this.setQuery(queryId, function (_a) {
                        var subscriptions = _a.subscriptions;
                        return ({
                            subscriptions: subscriptions.filter(function (x) { return x !== subscription; }),
                        });
                    });
                    reject(error);
                },
                complete: function () {
                    _this.removeFetchQueryPromise(requestId);
                    _this.setQuery(queryId, function (_a) {
                        var subscriptions = _a.subscriptions;
                        return ({
                            subscriptions: subscriptions.filter(function (x) { return x !== subscription; }),
                        });
                    });
                    resolve({
                        data: resultFromStore,
                        errors: errorsFromStore,
                        loading: false,
                        networkStatus: NetworkStatus.ready,
                        stale: false,
                    });
                },
            });
            _this.setQuery(queryId, function (_a) {
                var subscriptions = _a.subscriptions;
                return ({
                    subscriptions: subscriptions.concat([subscription]),
                });
            });
        });
    };
    // Refetches a query given that query's name. Refetches
    // all ObservableQuery instances associated with the query name.
    QueryManager.prototype.refetchQueryByName = function (queryName) {
        var _this = this;
        var refetchedQueries = this.queryIdsByName[queryName];
        // early return if the query named does not exist (not yet fetched)
        // this used to warn but it may be inteneded behavoir to try and refetch
        // un called queries because they could be on different routes
        if (refetchedQueries === undefined)
            return;
        return Promise.all(refetchedQueries
            .map(function (id) { return _this.getQuery(id).observableQuery; })
            .filter(function (x) { return !!x; })
            .map(function (x) { return x.refetch(); }));
    };
    QueryManager.prototype.generateRequestId = function () {
        var requestId = this.idCounter;
        this.idCounter++;
        return requestId;
    };
    QueryManager.prototype.getQuery = function (queryId) {
        return this.queries.get(queryId) || __assign$5({}, defaultQueryInfo);
    };
    QueryManager.prototype.setQuery = function (queryId, updater) {
        var prev = this.getQuery(queryId);
        var newInfo = __assign$5({}, prev, updater(prev));
        this.queries.set(queryId, newInfo);
    };
    QueryManager.prototype.invalidate = function (invalidated, queryId, fetchMoreForQueryId) {
        if (queryId)
            this.setQuery(queryId, function () { return ({ invalidated: invalidated }); });
        if (fetchMoreForQueryId) {
            this.setQuery(fetchMoreForQueryId, function () { return ({ invalidated: invalidated }); });
        }
    };
    QueryManager.prototype.buildOperationForLink = function (document, variables, extraContext) {
        var cache = this.dataStore.getCache();
        return {
            query: cache.transformForLink
                ? cache.transformForLink(document)
                : document,
            variables: variables,
            operationName: getOperationName(document) || undefined,
            context: __assign$5({}, extraContext, { cache: cache, 
                // getting an entry's cache key is useful for cacheResolvers & state-link
                getCacheKey: function (obj) {
                    if (cache.config) {
                        // on the link, we just want the id string, not the full id value from toIdValue
                        return cache.config.dataIdFromObject(obj);
                    }
                    else {
                        throw new Error('To use context.getCacheKey, you need to use a cache that has a configurable dataIdFromObject, like apollo-cache-inmemory.');
                    }
                } }),
        };
    };
    return QueryManager;
}());

var DataStore = (function () {
    function DataStore(initialCache) {
        this.cache = initialCache;
    }
    DataStore.prototype.getCache = function () {
        return this.cache;
    };
    DataStore.prototype.markQueryResult = function (result, document, variables, fetchMoreForQueryId, ignoreErrors) {
        if (ignoreErrors === void 0) { ignoreErrors = false; }
        var writeWithErrors = !graphQLResultHasError(result);
        if (ignoreErrors && graphQLResultHasError(result) && result.data) {
            writeWithErrors = true;
        }
        if (!fetchMoreForQueryId && writeWithErrors) {
            this.cache.write({
                result: result.data,
                dataId: 'ROOT_QUERY',
                query: document,
                variables: variables,
            });
        }
    };
    DataStore.prototype.markSubscriptionResult = function (result, document, variables) {
        // the subscription interface should handle not sending us results we no longer subscribe to.
        // XXX I don't think we ever send in an object with errors, but we might in the future...
        if (!graphQLResultHasError(result)) {
            this.cache.write({
                result: result.data,
                dataId: 'ROOT_SUBSCRIPTION',
                query: document,
                variables: variables,
            });
        }
    };
    DataStore.prototype.markMutationInit = function (mutation) {
        var _this = this;
        if (mutation.optimisticResponse) {
            var optimistic_1;
            if (typeof mutation.optimisticResponse === 'function') {
                optimistic_1 = mutation.optimisticResponse(mutation.variables);
            }
            else {
                optimistic_1 = mutation.optimisticResponse;
            }
            var changeFn_1 = function () {
                _this.markMutationResult({
                    mutationId: mutation.mutationId,
                    result: { data: optimistic_1 },
                    document: mutation.document,
                    variables: mutation.variables,
                    updateQueries: mutation.updateQueries,
                    update: mutation.update,
                });
            };
            this.cache.recordOptimisticTransaction(function (c) {
                var orig = _this.cache;
                _this.cache = c;
                try {
                    changeFn_1();
                }
                finally {
                    _this.cache = orig;
                }
            }, mutation.mutationId);
        }
    };
    DataStore.prototype.markMutationResult = function (mutation) {
        var _this = this;
        // Incorporate the result from this mutation into the store
        if (!graphQLResultHasError(mutation.result)) {
            var cacheWrites_1 = [];
            cacheWrites_1.push({
                result: mutation.result.data,
                dataId: 'ROOT_MUTATION',
                query: mutation.document,
                variables: mutation.variables,
            });
            if (mutation.updateQueries) {
                Object.keys(mutation.updateQueries)
                    .filter(function (id) { return mutation.updateQueries[id]; })
                    .forEach(function (queryId) {
                    var _a = mutation.updateQueries[queryId], query = _a.query, updater = _a.updater;
                    // Read the current query result from the store.
                    var _b = _this.cache.diff({
                        query: query.document,
                        variables: query.variables,
                        returnPartialData: true,
                        optimistic: false,
                    }), currentQueryResult = _b.result, complete = _b.complete;
                    if (!complete) {
                        return;
                    }
                    // Run our reducer using the current query result and the mutation result.
                    var nextQueryResult = tryFunctionOrLogError(function () {
                        return updater(currentQueryResult, {
                            mutationResult: mutation.result,
                            queryName: getOperationName(query.document) || undefined,
                            queryVariables: query.variables,
                        });
                    });
                    // Write the modified result back into the store if we got a new result.
                    if (nextQueryResult) {
                        cacheWrites_1.push({
                            result: nextQueryResult,
                            dataId: 'ROOT_QUERY',
                            query: query.document,
                            variables: query.variables,
                        });
                    }
                });
            }
            this.cache.performTransaction(function (c) {
                cacheWrites_1.forEach(function (write) { return c.write(write); });
            });
            // If the mutation has some writes associated with it then we need to
            // apply those writes to the store by running this reducer again with a
            // write action.
            var update_1 = mutation.update;
            if (update_1) {
                this.cache.performTransaction(function (c) {
                    tryFunctionOrLogError(function () { return update_1(c, mutation.result); });
                });
            }
        }
    };
    DataStore.prototype.markMutationComplete = function (_a) {
        var mutationId = _a.mutationId, optimisticResponse = _a.optimisticResponse;
        if (!optimisticResponse)
            return;
        this.cache.removeOptimistic(mutationId);
    };
    DataStore.prototype.markUpdateQueryResult = function (document, variables, newResult) {
        this.cache.write({
            result: newResult,
            dataId: 'ROOT_QUERY',
            variables: variables,
            query: document,
        });
    };
    DataStore.prototype.reset = function () {
        return this.cache.reset();
    };
    return DataStore;
}());

var version_1 = "2.3.1";

var __assign$4 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var hasSuggestedDevtools = false;
var supportedDirectives = new ApolloLink(function (operation, forward) {
    operation.query = removeConnectionDirectiveFromDocument(operation.query);
    return forward(operation);
});
/**
 * This is the primary Apollo Client class. It is used to send GraphQL documents (i.e. queries
 * and mutations) to a GraphQL spec-compliant server over a {@link NetworkInterface} instance,
 * receive results from the server and cache the results in a store. It also delivers updates
 * to GraphQL queries through {@link Observable} instances.
 */
var ApolloClient$2 = (function () {
    /**
     * Constructs an instance of {@link ApolloClient}.
     *
     * @param link The {@link ApolloLink} over which GraphQL documents will be resolved into a response.
     *
     * @param cache The initial cache to use in the data store.
     *
     * @param ssrMode Determines whether this is being run in Server Side Rendering (SSR) mode.
     *
     * @param ssrForceFetchDelay Determines the time interval before we force fetch queries for a
     * server side render.
     *
     * @param queryDeduplication If set to false, a query will still be sent to the server even if a query
     * with identical parameters (query, variables, operationName) is already in flight.
     *
     */
    function ApolloClient(options) {
        var _this = this;
        this.defaultOptions = {};
        this.resetStoreCallbacks = [];
        var link = options.link, cache = options.cache, _a = options.ssrMode, ssrMode = _a === void 0 ? false : _a, _b = options.ssrForceFetchDelay, ssrForceFetchDelay = _b === void 0 ? 0 : _b, connectToDevTools = options.connectToDevTools, _c = options.queryDeduplication, queryDeduplication = _c === void 0 ? true : _c, defaultOptions = options.defaultOptions;
        if (!link || !cache) {
            throw new Error("\n        In order to initialize Apollo Client, you must specify link & cache properties on the config object.\n        This is part of the required upgrade when migrating from Apollo Client 1.0 to Apollo Client 2.0.\n        For more information, please visit:\n          https://www.apollographql.com/docs/react/basics/setup.html\n        to help you get started.\n      ");
        }
        // remove apollo-client supported directives
        this.link = supportedDirectives.concat(link);
        this.cache = cache;
        this.store = new DataStore(cache);
        this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
        this.queryDeduplication = queryDeduplication;
        this.ssrMode = ssrMode;
        this.defaultOptions = defaultOptions || {};
        if (ssrForceFetchDelay) {
            setTimeout(function () { return (_this.disableNetworkFetches = false); }, ssrForceFetchDelay);
        }
        this.watchQuery = this.watchQuery.bind(this);
        this.query = this.query.bind(this);
        this.mutate = this.mutate.bind(this);
        this.resetStore = this.resetStore.bind(this);
        this.reFetchObservableQueries = this.reFetchObservableQueries.bind(this);
        // Attach the client instance to window to let us be found by chrome devtools, but only in
        // development mode
        var defaultConnectToDevTools = !isProduction() &&
            typeof window !== 'undefined' &&
            !window.__APOLLO_CLIENT__;
        if (typeof connectToDevTools === 'undefined'
            ? defaultConnectToDevTools
            : connectToDevTools && typeof window !== 'undefined') {
            window.__APOLLO_CLIENT__ = this;
        }
        /**
         * Suggest installing the devtools for developers who don't have them
         */
        if (!hasSuggestedDevtools && !isProduction()) {
            hasSuggestedDevtools = true;
            if (typeof window !== 'undefined' &&
                window.document &&
                window.top === window.self) {
                // First check if devtools is not installed
                if (typeof window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
                    // Only for Chrome
                    if (window.navigator && window.navigator.userAgent.indexOf('Chrome') > -1) {
                        // tslint:disable-next-line
                        console.debug('Download the Apollo DevTools ' +
                            'for a better development experience: ' +
                            'https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm');
                    }
                }
            }
        }
        this.version = version_1;
    }
    /**
     * This watches the results of the query according to the options specified and
     * returns an {@link ObservableQuery}. We can subscribe to this {@link ObservableQuery} and
     * receive updated results through a GraphQL observer.
     * <p /><p />
     * Note that this method is not an implementation of GraphQL subscriptions. Rather,
     * it uses Apollo's store in order to reactively deliver updates to your query results.
     * <p /><p />
     * For example, suppose you call watchQuery on a GraphQL query that fetches an person's
     * first name and last name and this person has a particular object identifer, provided by
     * dataIdFromObject. Later, a different query fetches that same person's
     * first and last name and his/her first name has now changed. Then, any observers associated
     * with the results of the first query will be updated with a new result object.
     * <p /><p />
     * See [here](https://medium.com/apollo-stack/the-concepts-of-graphql-bc68bd819be3#.3mb0cbcmc) for
     * a description of store reactivity.
     *
     */
    ApolloClient.prototype.watchQuery = function (options) {
        this.initQueryManager();
        if (this.defaultOptions.watchQuery) {
            options = __assign$4({}, this.defaultOptions.watchQuery, options);
        }
        // XXX Overwriting options is probably not the best way to do this long term...
        if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
            options = __assign$4({}, options, { fetchPolicy: 'cache-first' });
        }
        return this.queryManager.watchQuery(options);
    };
    /**
     * This resolves a single query according to the options specified and returns a
     * {@link Promise} which is either resolved with the resulting data or rejected
     * with an error.
     *
     * @param options An object of type {@link WatchQueryOptions} that allows us to describe
     * how this query should be treated e.g. whether it is a polling query, whether it should hit the
     * server at all or just resolve from the cache, etc.
     */
    ApolloClient.prototype.query = function (options) {
        this.initQueryManager();
        if (this.defaultOptions.query) {
            options = __assign$4({}, this.defaultOptions.query, options);
        }
        if (options.fetchPolicy === 'cache-and-network') {
            throw new Error('cache-and-network fetchPolicy can only be used with watchQuery');
        }
        // XXX Overwriting options is probably not the best way to do this long term...
        if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
            options = __assign$4({}, options, { fetchPolicy: 'cache-first' });
        }
        return this.queryManager.query(options);
    };
    /**
     * This resolves a single mutation according to the options specified and returns a
     * {@link Promise} which is either resolved with the resulting data or rejected with an
     * error.
     *
     * It takes options as an object with the following keys and values:
     */
    ApolloClient.prototype.mutate = function (options) {
        this.initQueryManager();
        if (this.defaultOptions.mutate) {
            options = __assign$4({}, this.defaultOptions.mutate, options);
        }
        return this.queryManager.mutate(options);
    };
    /**
     * This subscribes to a graphql subscription according to the options specified and returns an
     * {@link Observable} which either emits received data or an error.
     */
    ApolloClient.prototype.subscribe = function (options) {
        this.initQueryManager();
        return this.queryManager.startGraphQLSubscription(options);
    };
    /**
     * Tries to read some data from the store in the shape of the provided
     * GraphQL query without making a network request. This method will start at
     * the root query. To start at a specific id returned by `dataIdFromObject`
     * use `readFragment`.
     */
    ApolloClient.prototype.readQuery = function (options) {
        return this.initProxy().readQuery(options);
    };
    /**
     * Tries to read some data from the store in the shape of the provided
     * GraphQL fragment without making a network request. This method will read a
     * GraphQL fragment from any arbitrary id that is currently cached, unlike
     * `readQuery` which will only read from the root query.
     *
     * You must pass in a GraphQL document with a single fragment or a document
     * with multiple fragments that represent what you are reading. If you pass
     * in a document with multiple fragments then you must also specify a
     * `fragmentName`.
     */
    ApolloClient.prototype.readFragment = function (options) {
        return this.initProxy().readFragment(options);
    };
    /**
     * Writes some data in the shape of the provided GraphQL query directly to
     * the store. This method will start at the root query. To start at a a
     * specific id returned by `dataIdFromObject` then use `writeFragment`.
     */
    ApolloClient.prototype.writeQuery = function (options) {
        var result = this.initProxy().writeQuery(options);
        this.queryManager.broadcastQueries();
        return result;
    };
    /**
     * Writes some data in the shape of the provided GraphQL fragment directly to
     * the store. This method will write to a GraphQL fragment from any arbitrary
     * id that is currently cached, unlike `writeQuery` which will only write
     * from the root query.
     *
     * You must pass in a GraphQL document with a single fragment or a document
     * with multiple fragments that represent what you are writing. If you pass
     * in a document with multiple fragments then you must also specify a
     * `fragmentName`.
     */
    ApolloClient.prototype.writeFragment = function (options) {
        var result = this.initProxy().writeFragment(options);
        this.queryManager.broadcastQueries();
        return result;
    };
    /**
     * Sugar for writeQuery & writeFragment
     * This method will construct a query from the data object passed in.
     * If no id is supplied, writeData will write the data to the root.
     * If an id is supplied, writeData will write a fragment to the object
     * specified by the id in the store.
     *
     * Since you aren't passing in a query to check the shape of the data,
     * you must pass in an object that conforms to the shape of valid GraphQL data.
     */
    ApolloClient.prototype.writeData = function (options) {
        var result = this.initProxy().writeData(options);
        this.queryManager.broadcastQueries();
        return result;
    };
    ApolloClient.prototype.__actionHookForDevTools = function (cb) {
        this.devToolsHookCb = cb;
    };
    ApolloClient.prototype.__requestRaw = function (payload) {
        return execute(this.link, payload);
    };
    /**
     * This initializes the query manager that tracks queries and the cache
     */
    ApolloClient.prototype.initQueryManager = function () {
        var _this = this;
        if (this.queryManager)
            return;
        this.queryManager = new QueryManager({
            link: this.link,
            store: this.store,
            queryDeduplication: this.queryDeduplication,
            ssrMode: this.ssrMode,
            onBroadcast: function () {
                if (_this.devToolsHookCb) {
                    _this.devToolsHookCb({
                        action: {},
                        state: {
                            queries: _this.queryManager.queryStore.getStore(),
                            mutations: _this.queryManager.mutationStore.getStore(),
                        },
                        dataWithOptimisticResults: _this.cache.extract(true),
                    });
                }
            },
        });
    };
    /**
     * Resets your entire store by clearing out your cache and then re-executing
     * all of your active queries. This makes it so that you may guarantee that
     * there is no data left in your store from a time before you called this
     * method.
     *
     * `resetStore()` is useful when your user just logged out. You’ve removed the
     * user session, and you now want to make sure that any references to data you
     * might have fetched while the user session was active is gone.
     *
     * It is important to remember that `resetStore()` *will* refetch any active
     * queries. This means that any components that might be mounted will execute
     * their queries again using your network interface. If you do not want to
     * re-execute any queries then you should make sure to stop watching any
     * active queries.
     */
    ApolloClient.prototype.resetStore = function () {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            return _this.queryManager
                ? _this.queryManager.clearStore()
                : Promise.resolve(null);
        })
            .then(function () { return Promise.all(_this.resetStoreCallbacks.map(function (fn) { return fn(); })); })
            .then(function () {
            return _this.queryManager
                ? _this.queryManager.reFetchObservableQueries()
                : Promise.resolve(null);
        });
    };
    /**
     * Allows callbacks to be registered that are executed with the store is reset.
     * onResetStore returns an unsubscribe function for removing your registered callbacks.
     */
    ApolloClient.prototype.onResetStore = function (cb) {
        var _this = this;
        this.resetStoreCallbacks.push(cb);
        return function () {
            _this.resetStoreCallbacks = _this.resetStoreCallbacks.filter(function (c) { return c !== cb; });
        };
    };
    /**
     * Refetches all of your active queries.
     *
     * `reFetchObservableQueries()` is useful if you want to bring the client back to proper state in case of a network outage
     *
     * It is important to remember that `reFetchObservableQueries()` *will* refetch any active
     * queries. This means that any components that might be mounted will execute
     * their queries again using your network interface. If you do not want to
     * re-execute any queries then you should make sure to stop watching any
     * active queries.
     * Takes optional parameter `includeStandby` which will include queries in standby-mode when refetching.
     */
    ApolloClient.prototype.reFetchObservableQueries = function (includeStandby) {
        return this.queryManager
            ? this.queryManager.reFetchObservableQueries(includeStandby)
            : Promise.resolve(null);
    };
    /**
     * Exposes the cache's complete state, in a serializable format for later restoration.
     */
    ApolloClient.prototype.extract = function (optimistic) {
        return this.initProxy().extract(optimistic);
    };
    /**
     * Replaces existing state in the cache (if any) with the values expressed by
     * `serializedState`.
     *
     * Called when hydrating a cache (server side rendering, or offline storage),
     * and also (potentially) during hot reloads.
     */
    ApolloClient.prototype.restore = function (serializedState) {
        return this.initProxy().restore(serializedState);
    };
    /**
     * Initializes a data proxy for this client instance if one does not already
     * exist and returns either a previously initialized proxy instance or the
     * newly initialized instance.
     */
    ApolloClient.prototype.initProxy = function () {
        if (!this.proxy) {
            this.initQueryManager();
            this.proxy = this.cache;
        }
        return this.proxy;
    };
    return ApolloClient;
}());



var apolloClient = Object.freeze({
	ApolloClient: ApolloClient$2,
	default: ApolloClient$2,
	printAST: printer_1,
	ObservableQuery: ObservableQuery,
	get NetworkStatus () { return NetworkStatus; },
	ApolloError: ApolloError,
	get FetchType () { return FetchType; }
});

function queryFromPojo(obj) {
    var op = {
        kind: 'OperationDefinition',
        operation: 'query',
        name: {
            kind: 'Name',
            value: 'GeneratedClientQuery',
        },
        selectionSet: selectionSetFromObj(obj),
    };
    var out = {
        kind: 'Document',
        definitions: [op],
    };
    return out;
}
function fragmentFromPojo(obj, typename) {
    var frag = {
        kind: 'FragmentDefinition',
        typeCondition: {
            kind: 'NamedType',
            name: {
                kind: 'Name',
                value: typename || '__FakeType',
            },
        },
        name: {
            kind: 'Name',
            value: 'GeneratedClientQuery',
        },
        selectionSet: selectionSetFromObj(obj),
    };
    var out = {
        kind: 'Document',
        definitions: [frag],
    };
    return out;
}
function selectionSetFromObj(obj) {
    if (typeof obj === 'number' ||
        typeof obj === 'boolean' ||
        typeof obj === 'string' ||
        typeof obj === 'undefined' ||
        obj === null) {
        // No selection set here
        return null;
    }
    if (Array.isArray(obj)) {
        // GraphQL queries don't include arrays
        return selectionSetFromObj(obj[0]);
    }
    // Now we know it's an object
    var selections = [];
    Object.keys(obj).forEach(function (key) {
        var field = {
            kind: 'Field',
            name: {
                kind: 'Name',
                value: key,
            },
        };
        // Recurse
        var nestedSelSet = selectionSetFromObj(obj[key]);
        if (nestedSelSet) {
            field.selectionSet = nestedSelSet;
        }
        selections.push(field);
    });
    var selectionSet = {
        kind: 'SelectionSet',
        selections: selections,
    };
    return selectionSet;
}
var justTypenameQuery = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: null,
            variableDefinitions: null,
            directives: [],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        alias: null,
                        name: {
                            kind: 'Name',
                            value: '__typename',
                        },
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                    },
                ],
            },
        },
    ],
};

var __assign$9 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var ApolloCache = /** @class */ (function () {
    function ApolloCache() {
    }
    // optional API
    ApolloCache.prototype.transformDocument = function (document) {
        return document;
    };
    // experimental
    ApolloCache.prototype.transformForLink = function (document) {
        return document;
    };
    // DataProxy API
    /**
     *
     * @param options
     * @param optimistic
     */
    ApolloCache.prototype.readQuery = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            query: options.query,
            variables: options.variables,
            optimistic: optimistic,
        });
    };
    ApolloCache.prototype.readFragment = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            query: getFragmentQueryDocument(options.fragment, options.fragmentName),
            variables: options.variables,
            rootId: options.id,
            optimistic: optimistic,
        });
    };
    ApolloCache.prototype.writeQuery = function (options) {
        this.write({
            dataId: 'ROOT_QUERY',
            result: options.data,
            query: options.query,
            variables: options.variables,
        });
    };
    ApolloCache.prototype.writeFragment = function (options) {
        this.write({
            dataId: options.id,
            result: options.data,
            variables: options.variables,
            query: getFragmentQueryDocument(options.fragment, options.fragmentName),
        });
    };
    ApolloCache.prototype.writeData = function (_a) {
        var id = _a.id, data = _a.data;
        if (typeof id !== 'undefined') {
            var typenameResult = null;
            // Since we can't use fragments without having a typename in the store,
            // we need to make sure we have one.
            // To avoid overwriting an existing typename, we need to read it out first
            // and generate a fake one if none exists.
            try {
                typenameResult = this.read({
                    rootId: id,
                    optimistic: false,
                    query: justTypenameQuery,
                });
            }
            catch (e) {
                // Do nothing, since an error just means no typename exists
            }
            // tslint:disable-next-line
            var __typename = (typenameResult && typenameResult.__typename) || '__ClientData';
            // Add a type here to satisfy the inmemory cache
            var dataToWrite = __assign$9({ __typename: __typename }, data);
            this.writeFragment({
                id: id,
                fragment: fragmentFromPojo(dataToWrite, __typename),
                data: dataToWrite,
            });
        }
        else {
            this.writeQuery({ query: queryFromPojo(data), data: data });
        }
    };
    return ApolloCache;
}());

var haveWarned$1 = false;
/**
 * This fragment matcher is very basic and unable to match union or interface type conditions
 */
var HeuristicFragmentMatcher = /** @class */ (function () {
    function HeuristicFragmentMatcher() {
        // do nothing
    }
    HeuristicFragmentMatcher.prototype.ensureReady = function () {
        return Promise.resolve();
    };
    HeuristicFragmentMatcher.prototype.canBypassInit = function () {
        return true; // we don't need to initialize this fragment matcher.
    };
    HeuristicFragmentMatcher.prototype.match = function (idValue, typeCondition, context) {
        var obj = context.store.get(idValue.id);
        if (!obj) {
            return false;
        }
        if (!obj.__typename) {
            if (!haveWarned$1) {
                console.warn("You're using fragments in your queries, but either don't have the addTypename:\n  true option set in Apollo Client, or you are trying to write a fragment to the store without the __typename.\n   Please turn on the addTypename option and include __typename when writing fragments so that Apollo Client\n   can accurately match fragments.");
                console.warn('Could not find __typename on Fragment ', typeCondition, obj);
                console.warn("DEPRECATION WARNING: using fragments without __typename is unsupported behavior " +
                    "and will be removed in future versions of Apollo client. You should fix this and set addTypename to true now.");
                /* istanbul ignore if */
                if (!isTest()) {
                    // When running tests, we want to print the warning every time
                    haveWarned$1 = true;
                }
            }
            context.returnPartialData = true;
            return true;
        }
        if (obj.__typename === typeCondition) {
            return true;
        }
        // XXX here we reach an issue - we don't know if this fragment should match or not. It's either:
        // 1. A fragment on a non-matching concrete type or interface or union
        // 2. A fragment on a matching interface or union
        // If it's 1, we don't want to return anything, if it's 2 we want to match. We can't tell the
        // difference, so we warn the user, but still try to match it (backcompat).
        warnOnceInDevelopment("You are using the simple (heuristic) fragment matcher, but your queries contain union or interface types.\n     Apollo Client will not be able to able to accurately map fragments." +
            "To make this error go away, use the IntrospectionFragmentMatcher as described in the docs: " +
            "https://www.apollographql.com/docs/react/recipes/fragment-matching.html", 'error');
        context.returnPartialData = true;
        return true;
    };
    return HeuristicFragmentMatcher;
}());
var IntrospectionFragmentMatcher = /** @class */ (function () {
    function IntrospectionFragmentMatcher(options) {
        if (options && options.introspectionQueryResultData) {
            this.possibleTypesMap = this.parseIntrospectionResult(options.introspectionQueryResultData);
            this.isReady = true;
        }
        else {
            this.isReady = false;
        }
        this.match = this.match.bind(this);
    }
    IntrospectionFragmentMatcher.prototype.match = function (idValue, typeCondition, context) {
        if (!this.isReady) {
            // this should basically never happen in proper use.
            throw new Error('FragmentMatcher.match() was called before FragmentMatcher.init()');
        }
        var obj = context.store.get(idValue.id);
        if (!obj) {
            return false;
        }
        if (!obj.__typename) {
            throw new Error("Cannot match fragment because __typename property is missing: " + JSON.stringify(obj));
        }
        if (obj.__typename === typeCondition) {
            return true;
        }
        var implementingTypes = this.possibleTypesMap[typeCondition];
        if (implementingTypes && implementingTypes.indexOf(obj.__typename) > -1) {
            return true;
        }
        return false;
    };
    IntrospectionFragmentMatcher.prototype.parseIntrospectionResult = function (introspectionResultData) {
        var typeMap = {};
        introspectionResultData.__schema.types.forEach(function (type) {
            if (type.kind === 'UNION' || type.kind === 'INTERFACE') {
                typeMap[type.name] = type.possibleTypes.map(function (implementingType) { return implementingType.name; });
            }
        });
        return typeMap;
    };
    return IntrospectionFragmentMatcher;
}());

var ObjectCache = /** @class */ (function () {
    function ObjectCache(data) {
        if (data === void 0) { data = Object.create(null); }
        this.data = data;
    }
    ObjectCache.prototype.toObject = function () {
        return this.data;
    };
    ObjectCache.prototype.get = function (dataId) {
        return this.data[dataId];
    };
    ObjectCache.prototype.set = function (dataId, value) {
        this.data[dataId] = value;
    };
    ObjectCache.prototype.delete = function (dataId) {
        this.data[dataId] = undefined;
    };
    ObjectCache.prototype.clear = function () {
        this.data = Object.create(null);
    };
    ObjectCache.prototype.replace = function (newData) {
        this.data = newData || Object.create(null);
    };
    return ObjectCache;
}());
function defaultNormalizedCacheFactory(seed) {
    return new ObjectCache(seed);
}

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$10 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var WriteError = /** @class */ (function (_super) {
    __extends$6(WriteError, _super);
    function WriteError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'WriteError';
        return _this;
    }
    return WriteError;
}(Error));
function enhanceErrorWithDocument(error, document) {
    // XXX A bit hacky maybe ...
    var enhancedError = new WriteError("Error writing result to store for query:\n " + printer_1(document));
    enhancedError.message += '\n' + error.message;
    enhancedError.stack = error.stack;
    return enhancedError;
}
/**
 * Writes the result of a query to the store.
 *
 * @param result The result object returned for the query document.
 *
 * @param query The query document whose result we are writing to the store.
 *
 * @param store The {@link NormalizedCache} used by Apollo for the `data` portion of the store.
 *
 * @param variables A map from the name of a variable to its value. These variables can be
 * referenced by the query document.
 *
 * @param dataIdFromObject A function that returns an object identifier given a particular result
 * object. See the store documentation for details and an example of this function.
 *
 * @param fragmentMap A map from the name of a fragment to its fragment definition. These fragments
 * can be referenced within the query document.
 *
 * @param fragmentMatcherFunction A function to use for matching fragment conditions in GraphQL documents
 */
function writeQueryToStore(_a) {
    var result = _a.result, query = _a.query, _b = _a.storeFactory, storeFactory = _b === void 0 ? defaultNormalizedCacheFactory : _b, _c = _a.store, store = _c === void 0 ? storeFactory() : _c, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, _d = _a.fragmentMap, fragmentMap = _d === void 0 ? {} : _d, fragmentMatcherFunction = _a.fragmentMatcherFunction;
    var queryDefinition = getQueryDefinition(query);
    variables = assign({}, getDefaultValues(queryDefinition), variables);
    try {
        return writeSelectionSetToStore({
            dataId: 'ROOT_QUERY',
            result: result,
            selectionSet: queryDefinition.selectionSet,
            context: {
                store: store,
                storeFactory: storeFactory,
                processedData: {},
                variables: variables,
                dataIdFromObject: dataIdFromObject,
                fragmentMap: fragmentMap,
                fragmentMatcherFunction: fragmentMatcherFunction,
            },
        });
    }
    catch (e) {
        throw enhanceErrorWithDocument(e, query);
    }
}
function writeResultToStore(_a) {
    var dataId = _a.dataId, result = _a.result, document = _a.document, _b = _a.storeFactory, storeFactory = _b === void 0 ? defaultNormalizedCacheFactory : _b, _c = _a.store, store = _c === void 0 ? storeFactory() : _c, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, fragmentMatcherFunction = _a.fragmentMatcherFunction;
    // XXX TODO REFACTOR: this is a temporary workaround until query normalization is made to work with documents.
    var operationDefinition = getOperationDefinition(document);
    var selectionSet = operationDefinition.selectionSet;
    var fragmentMap = createFragmentMap(getFragmentDefinitions(document));
    variables = assign({}, getDefaultValues(operationDefinition), variables);
    try {
        return writeSelectionSetToStore({
            result: result,
            dataId: dataId,
            selectionSet: selectionSet,
            context: {
                store: store,
                storeFactory: storeFactory,
                processedData: {},
                variables: variables,
                dataIdFromObject: dataIdFromObject,
                fragmentMap: fragmentMap,
                fragmentMatcherFunction: fragmentMatcherFunction,
            },
        });
    }
    catch (e) {
        throw enhanceErrorWithDocument(e, document);
    }
}
function writeSelectionSetToStore(_a) {
    var result = _a.result, dataId = _a.dataId, selectionSet = _a.selectionSet, context = _a.context;
    var variables = context.variables, store = context.store, fragmentMap = context.fragmentMap;
    selectionSet.selections.forEach(function (selection) {
        var included = shouldInclude(selection, variables);
        if (isField(selection)) {
            var resultFieldKey = resultKeyNameFromField(selection);
            var value = result[resultFieldKey];
            if (included) {
                if (typeof value !== 'undefined') {
                    writeFieldToStore({
                        dataId: dataId,
                        value: value,
                        field: selection,
                        context: context,
                    });
                }
                else {
                    // if this is a defered field we don't need to throw / warn
                    var isDefered = selection.directives &&
                        selection.directives.length &&
                        selection.directives.some(function (directive) { return directive.name && directive.name.value === 'defer'; });
                    if (!isDefered && context.fragmentMatcherFunction) {
                        // XXX We'd like to throw an error, but for backwards compatibility's sake
                        // we just print a warning for the time being.
                        //throw new WriteError(`Missing field ${resultFieldKey} in ${JSON.stringify(result, null, 2).substring(0, 100)}`);
                        if (!isProduction()) {
                            console.warn("Missing field " + resultFieldKey + " in " + JSON.stringify(result, null, 2).substring(0, 100));
                        }
                    }
                }
            }
        }
        else {
            // This is not a field, so it must be a fragment, either inline or named
            var fragment = void 0;
            if (isInlineFragment(selection)) {
                fragment = selection;
            }
            else {
                // Named fragment
                fragment = (fragmentMap || {})[selection.name.value];
                if (!fragment) {
                    throw new Error("No fragment named " + selection.name.value + ".");
                }
            }
            var matches = true;
            if (context.fragmentMatcherFunction && fragment.typeCondition) {
                // TODO we need to rewrite the fragment matchers for this to work properly and efficiently
                // Right now we have to pretend that we're passing in an idValue and that there's a store
                // on the context.
                var idValue = toIdValue({ id: 'self', typename: undefined });
                var fakeContext = {
                    // NOTE: fakeContext always uses ObjectCache
                    // since this is only to ensure the return value of 'matches'
                    store: new ObjectCache({ self: result }),
                    returnPartialData: false,
                    hasMissingField: false,
                    cacheRedirects: {},
                };
                matches = context.fragmentMatcherFunction(idValue, fragment.typeCondition.name.value, fakeContext);
                if (!isProduction() && fakeContext.returnPartialData) {
                    console.error('WARNING: heuristic fragment matching going on!');
                }
            }
            if (included && matches) {
                writeSelectionSetToStore({
                    result: result,
                    selectionSet: fragment.selectionSet,
                    dataId: dataId,
                    context: context,
                });
            }
        }
    });
    return store;
}
// Checks if the id given is an id that was generated by Apollo
// rather than by dataIdFromObject.
function isGeneratedId(id) {
    return id[0] === '$';
}
function mergeWithGenerated(generatedKey, realKey, cache) {
    var generated = cache.get(generatedKey);
    var real = cache.get(realKey);
    Object.keys(generated).forEach(function (key) {
        var value = generated[key];
        var realValue = real[key];
        if (isIdValue(value) && isGeneratedId(value.id) && isIdValue(realValue)) {
            mergeWithGenerated(value.id, realValue.id, cache);
        }
        cache.delete(generatedKey);
        cache.set(realKey, __assign$10({}, generated, real));
    });
}
function isDataProcessed(dataId, field, processedData) {
    if (!processedData) {
        return false;
    }
    if (processedData[dataId]) {
        if (processedData[dataId].indexOf(field) >= 0) {
            return true;
        }
        else {
            processedData[dataId].push(field);
        }
    }
    else {
        processedData[dataId] = [field];
    }
    return false;
}
function writeFieldToStore(_a) {
    var field = _a.field, value = _a.value, dataId = _a.dataId, context = _a.context;
    var variables = context.variables, dataIdFromObject = context.dataIdFromObject, store = context.store;
    var storeValue;
    var storeObject;
    var storeFieldName = storeKeyNameFromField(field, variables);
    // specifies if we need to merge existing keys in the store
    var shouldMerge = false;
    // If we merge, this will be the generatedKey
    var generatedKey = '';
    // If this is a scalar value...
    if (!field.selectionSet || value === null) {
        storeValue =
            value != null && typeof value === 'object'
                ?
                    // an id.
                    { type: 'json', json: value }
                :
                    value;
    }
    else if (Array.isArray(value)) {
        var generatedId = dataId + "." + storeFieldName;
        storeValue = processArrayValue(value, generatedId, field.selectionSet, context);
    }
    else {
        // It's an object
        var valueDataId = dataId + "." + storeFieldName;
        var generated = true;
        // We only prepend the '$' if the valueDataId isn't already a generated
        // id.
        if (!isGeneratedId(valueDataId)) {
            valueDataId = '$' + valueDataId;
        }
        if (dataIdFromObject) {
            var semanticId = dataIdFromObject(value);
            // We throw an error if the first character of the id is '$. This is
            // because we use that character to designate an Apollo-generated id
            // and we use the distinction between user-desiginated and application-provided
            // ids when managing overwrites.
            if (semanticId && isGeneratedId(semanticId)) {
                throw new Error('IDs returned by dataIdFromObject cannot begin with the "$" character.');
            }
            if (semanticId) {
                valueDataId = semanticId;
                generated = false;
            }
        }
        if (!isDataProcessed(valueDataId, field, context.processedData)) {
            writeSelectionSetToStore({
                dataId: valueDataId,
                result: value,
                selectionSet: field.selectionSet,
                context: context,
            });
        }
        // We take the id and escape it (i.e. wrap it with an enclosing object).
        // This allows us to distinguish IDs from normal scalars.
        var typename = value.__typename;
        storeValue = toIdValue({ id: valueDataId, typename: typename }, generated);
        // check if there was a generated id at the location where we're
        // about to place this new id. If there was, we have to merge the
        // data from that id with the data we're about to write in the store.
        storeObject = store.get(dataId);
        var escapedId = storeObject && storeObject[storeFieldName];
        if (escapedId !== storeValue && isIdValue(escapedId)) {
            var hadTypename = escapedId.typename !== undefined;
            var hasTypename = typename !== undefined;
            var typenameChanged = hadTypename && hasTypename && escapedId.typename !== typename;
            // If there is already a real id in the store and the current id we
            // are dealing with is generated, we throw an error.
            // One exception we allow is when the typename has changed, which occurs
            // when schema defines a union, both with and without an ID in the same place.
            // checks if we "lost" the read id
            if (generated && !escapedId.generated && !typenameChanged) {
                throw new Error("Store error: the application attempted to write an object with no provided id" +
                    (" but the store already contains an id of " + escapedId.id + " for this object. The selectionSet") +
                    " that was trying to be written is:\n" +
                    printer_1(field));
            }
            // checks if we "lost" the typename
            if (hadTypename && !hasTypename) {
                throw new Error("Store error: the application attempted to write an object with no provided typename" +
                    (" but the store already contains an object with typename of " + escapedId.typename + " for the object of id " + escapedId.id + ". The selectionSet") +
                    " that was trying to be written is:\n" +
                    printer_1(field));
            }
            if (escapedId.generated) {
                generatedKey = escapedId.id;
                // we should only merge if it's an object of the same type
                // otherwise, we should delete the generated object
                if (typenameChanged) {
                    store.delete(generatedKey);
                }
                else {
                    shouldMerge = true;
                }
            }
        }
    }
    var newStoreObj = __assign$10({}, store.get(dataId), (_b = {}, _b[storeFieldName] = storeValue, _b));
    if (shouldMerge) {
        mergeWithGenerated(generatedKey, storeValue.id, store);
    }
    storeObject = store.get(dataId);
    if (!storeObject || storeValue !== storeObject[storeFieldName]) {
        store.set(dataId, newStoreObj);
    }
    var _b;
}
function processArrayValue(value, generatedId, selectionSet, context) {
    return value.map(function (item, index) {
        if (item === null) {
            return null;
        }
        var itemDataId = generatedId + "." + index;
        if (Array.isArray(item)) {
            return processArrayValue(item, itemDataId, selectionSet, context);
        }
        var generated = true;
        if (context.dataIdFromObject) {
            var semanticId = context.dataIdFromObject(item);
            if (semanticId) {
                itemDataId = semanticId;
                generated = false;
            }
        }
        if (!isDataProcessed(itemDataId, selectionSet, context.processedData)) {
            writeSelectionSetToStore({
                dataId: itemDataId,
                result: item,
                selectionSet: selectionSet,
                context: context,
            });
        }
        return toIdValue({ id: itemDataId, typename: item.__typename }, generated);
    });
}

/* Based on graphql function from graphql-js:
 *
 * graphql(
 *   schema: GraphQLSchema,
 *   requestString: string,
 *   rootValue?: ?any,
 *   contextValue?: ?any,
 *   variableValues?: ?{[key: string]: any},
 *   operationName?: ?string
 * ): Promise<GraphQLResult>
 *
 * The default export as of graphql-anywhere is sync as of 4.0,
 * but below is an exported alternative that is async.
 * In the 5.0 version, this will be the only export again
 * and it will be async
 *
 */
function graphql$1(resolver, document, rootValue, contextValue, variableValues, execOptions) {
    if (execOptions === void 0) { execOptions = {}; }
    var mainDefinition = getMainDefinition(document);
    var fragments = getFragmentDefinitions(document);
    var fragmentMap = createFragmentMap(fragments);
    var resultMapper = execOptions.resultMapper;
    // Default matcher always matches all fragments
    var fragmentMatcher = execOptions.fragmentMatcher || (function () { return true; });
    var execContext = {
        fragmentMap: fragmentMap,
        contextValue: contextValue,
        variableValues: variableValues,
        resultMapper: resultMapper,
        resolver: resolver,
        fragmentMatcher: fragmentMatcher,
    };
    return executeSelectionSet(mainDefinition.selectionSet, rootValue, execContext);
}
function executeSelectionSet(selectionSet, rootValue, execContext) {
    var fragmentMap = execContext.fragmentMap, contextValue = execContext.contextValue, variables = execContext.variableValues;
    var result = {};
    selectionSet.selections.forEach(function (selection) {
        if (!shouldInclude(selection, variables)) {
            // Skip this entirely
            return;
        }
        if (isField(selection)) {
            var fieldResult = executeField(selection, rootValue, execContext);
            var resultFieldKey = resultKeyNameFromField(selection);
            if (fieldResult !== undefined) {
                if (result[resultFieldKey] === undefined) {
                    result[resultFieldKey] = fieldResult;
                }
                else {
                    merge(result[resultFieldKey], fieldResult);
                }
            }
        }
        else {
            var fragment = void 0;
            if (isInlineFragment(selection)) {
                fragment = selection;
            }
            else {
                // This is a named fragment
                fragment = fragmentMap[selection.name.value];
                if (!fragment) {
                    throw new Error("No fragment named " + selection.name.value);
                }
            }
            var typeCondition = fragment.typeCondition.name.value;
            if (execContext.fragmentMatcher(rootValue, typeCondition, contextValue)) {
                var fragmentResult = executeSelectionSet(fragment.selectionSet, rootValue, execContext);
                merge(result, fragmentResult);
            }
        }
    });
    if (execContext.resultMapper) {
        return execContext.resultMapper(result, rootValue);
    }
    return result;
}
function executeField(field, rootValue, execContext) {
    var variables = execContext.variableValues, contextValue = execContext.contextValue, resolver = execContext.resolver;
    var fieldName = field.name.value;
    var args = argumentsObjectFromField(field, variables);
    var info = {
        isLeaf: !field.selectionSet,
        resultKey: resultKeyNameFromField(field),
        directives: getDirectiveInfoFromField(field, variables),
    };
    var result = resolver(fieldName, rootValue, args, contextValue, info);
    // Handle all scalar types here
    if (!field.selectionSet) {
        return result;
    }
    // From here down, the field has a selection set, which means it's trying to
    // query a GraphQLObjectType
    if (result == null) {
        // Basically any field in a GraphQL response can be null, or missing
        return result;
    }
    if (Array.isArray(result)) {
        return executeSubSelectedArray(field, result, execContext);
    }
    // Returned value is an object, and the query has a sub-selection. Recurse.
    return executeSelectionSet(field.selectionSet, result, execContext);
}
function executeSubSelectedArray(field, result, execContext) {
    return result.map(function (item) {
        // null value in array
        if (item === null) {
            return null;
        }
        // This is a nested array, recurse
        if (Array.isArray(item)) {
            return executeSubSelectedArray(field, item, execContext);
        }
        // This is an object, run the selection set on it
        return executeSelectionSet(field.selectionSet, item, execContext);
    });
}
var hasOwn = Object.prototype.hasOwnProperty;
function merge(dest, src) {
    if (src !== null && typeof src === 'object') {
        Object.keys(src).forEach(function (key) {
            var srcVal = src[key];
            if (!hasOwn.call(dest, key)) {
                dest[key] = srcVal;
            }
            else {
                merge(dest[key], srcVal);
            }
        });
    }
}

// TODO: we should probably make check call propType and then throw,
// rather than the other way round, to avoid constructing stack traces
// for things like oneOf uses in React. At this stage I doubt many people
// are using this like that, but in the future, who knows?

var __assign$11 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * The key which the cache id for a given value is stored in the result object. This key is private
 * and should not be used by Apollo client users.
 *
 * Uses a symbol if available in the environment.
 *
 * @private
 */
var ID_KEY = typeof Symbol !== 'undefined' ? Symbol('id') : '@@id';
/**
 * Resolves the result of a query solely from the store (i.e. never hits the server).
 *
 * @param {Store} store The {@link NormalizedCache} used by Apollo for the `data` portion of the
 * store.
 *
 * @param {DocumentNode} query The query document to resolve from the data available in the store.
 *
 * @param {Object} [variables] A map from the name of a variable to its value. These variables can
 * be referenced by the query document.
 *
 * @param {any} previousResult The previous result returned by this function for the same query.
 * If nothing in the store changed since that previous result then values from the previous result
 * will be returned to preserve referential equality.
 */
function readQueryFromStore(options) {
    var optsPatch = { returnPartialData: false };
    return diffQueryAgainstStore(__assign$11({}, options, optsPatch)).result;
}
var readStoreResolver = function (fieldName, idValue, args, context, _a) {
    var resultKey = _a.resultKey, directives = _a.directives;
    assertIdValue(idValue);
    var objId = idValue.id;
    var obj = context.store.get(objId);
    var storeKeyName = fieldName;
    if (args || directives) {
        // We happen to know here that getStoreKeyName returns its first
        // argument unmodified if there are no args or directives, so we can
        // avoid calling the function at all in that case, as a small but
        // important optimization to this frequently executed code.
        storeKeyName = getStoreKeyName(storeKeyName, args, directives);
    }
    var fieldValue = void 0;
    if (obj) {
        fieldValue = obj[storeKeyName];
        if (typeof fieldValue === 'undefined' &&
            context.cacheRedirects &&
            (obj.__typename || objId === 'ROOT_QUERY')) {
            var typename = obj.__typename || 'Query';
            // Look for the type in the custom resolver map
            var type = context.cacheRedirects[typename];
            if (type) {
                // Look for the field in the custom resolver map
                var resolver = type[fieldName];
                if (resolver) {
                    fieldValue = resolver(obj, args, {
                        getCacheKey: function (storeObj) {
                            return toIdValue({
                                id: context.dataIdFromObject(storeObj),
                                typename: storeObj.__typename,
                            });
                        },
                    });
                }
            }
        }
    }
    if (typeof fieldValue === 'undefined') {
        if (!context.returnPartialData) {
            throw new Error("Can't find field " + storeKeyName + " on object (" + objId + ") " + JSON.stringify(obj, null, 2) + ".");
        }
        context.hasMissingField = true;
        return fieldValue;
    }
    // if this is an object scalar, it must be a json blob and we have to unescape it
    if (isJsonValue(fieldValue)) {
        // If the JSON blob is the same now as in the previous result, return the previous result to
        // maintain referential equality.
        //
        // `isEqual` will first perform a referential equality check (with `===`) in case the JSON
        // value has not changed in the store, and then a deep equality check if that fails in case a
        // new JSON object was returned by the API but that object may still be the same.
        if (idValue.previousResult &&
            isEqual(idValue.previousResult[resultKey], fieldValue.json)) {
            return idValue.previousResult[resultKey];
        }
        return fieldValue.json;
    }
    // If we had a previous result, try adding that previous result value for this field to our field
    // value. This will create a new value without mutating the old one.
    if (idValue.previousResult) {
        fieldValue = addPreviousResultToIdValues(fieldValue, idValue.previousResult[resultKey]);
    }
    return fieldValue;
};
/**
 * Given a store and a query, return as much of the result as possible and
 * identify if any data was missing from the store.
 * @param  {DocumentNode} query A parsed GraphQL query document
 * @param  {Store} store The Apollo Client store object
 * @param  {any} previousResult The previous result returned by this function for the same query
 * @return {result: Object, complete: [boolean]}
 */
function diffQueryAgainstStore(_a) {
    var store = _a.store, query = _a.query, variables = _a.variables, previousResult = _a.previousResult, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? true : _b, _c = _a.rootId, rootId = _c === void 0 ? 'ROOT_QUERY' : _c, fragmentMatcherFunction = _a.fragmentMatcherFunction, config = _a.config;
    // Throw the right validation error by trying to find a query in the document
    var queryDefinition = getQueryDefinition(query);
    variables = assign({}, getDefaultValues(queryDefinition), variables);
    var context = {
        // Global settings
        store: store,
        returnPartialData: returnPartialData,
        dataIdFromObject: (config && config.dataIdFromObject) || null,
        cacheRedirects: (config && config.cacheRedirects) || {},
        // Flag set during execution
        hasMissingField: false,
    };
    var rootIdValue = {
        type: 'id',
        id: rootId,
        previousResult: previousResult,
    };
    var result = graphql$1(readStoreResolver, query, rootIdValue, context, variables, {
        fragmentMatcher: fragmentMatcherFunction,
        resultMapper: resultMapper,
    });
    return {
        result: result,
        complete: !context.hasMissingField,
    };
}
function assertIdValue(idValue) {
    if (!isIdValue(idValue)) {
        throw new Error("Encountered a sub-selection on the query, but the store doesn't have an object reference. This should never happen during normal use unless you have custom code that is directly manipulating the store; please file an issue.");
    }
}
/**
 * Adds a previous result value to id values in a nested array. For a single id value and a single
 * previous result then the previous value is added directly.
 *
 * For arrays we put all of the ids from the previous result array in a map and add them to id
 * values with the same id.
 *
 * This function does not mutate. Instead it returns new instances of modified values.
 *
 * @private
 */
function addPreviousResultToIdValues(value, previousResult) {
    // If the value is an `IdValue`, add the previous result to it whether or not that
    // `previousResult` is undefined.
    //
    // If the value is an array, recurse over each item trying to add the `previousResult` for that
    // item.
    if (isIdValue(value)) {
        return __assign$11({}, value, { previousResult: previousResult });
    }
    else if (Array.isArray(value)) {
        var idToPreviousResult_1 = new Map();
        // If the previous result was an array, we want to build up our map of ids to previous results
        // using the private `ID_KEY` property that is added in `resultMapper`.
        if (Array.isArray(previousResult)) {
            previousResult.forEach(function (item) {
                // item can be null
                if (item && item[ID_KEY]) {
                    idToPreviousResult_1.set(item[ID_KEY], item);
                    // idToPreviousResult[item[ID_KEY]] = item;
                }
            });
        }
        // For every value we want to add the previous result.
        return value.map(function (item, i) {
            // By default the previous result for this item will be in the same array position as this
            // item.
            var itemPreviousResult = previousResult && previousResult[i];
            // If the item is an id value, we should check to see if there is a previous result for this
            // specific id. If there is, that will be the value for `itemPreviousResult`.
            if (isIdValue(item)) {
                itemPreviousResult =
                    idToPreviousResult_1.get(item.id) || itemPreviousResult;
            }
            return addPreviousResultToIdValues(item, itemPreviousResult);
        });
    }
    // Return the value, nothing changed.
    return value;
}
/**
 * Maps a result from `graphql-anywhere` to a final result value.
 *
 * If the result and the previous result from the `idValue` pass a shallow equality test, we just
 * return the `previousResult` to maintain referential equality.
 *
 * We also add a private id property to the result that we can use later on.
 *
 * @private
 */
function resultMapper(resultFields, idValue) {
    // If we had a previous result, we may be able to return that and preserve referential equality
    if (idValue.previousResult) {
        var currentResultKeys_1 = Object.keys(resultFields);
        var sameAsPreviousResult = 
        // Confirm that we have the same keys in both the current result and the previous result.
        Object.keys(idValue.previousResult).every(function (key) { return currentResultKeys_1.indexOf(key) > -1; }) &&
            // Perform a shallow comparison of the result fields with the previous result. If all of
            // the shallow fields are referentially equal to the fields of the previous result we can
            // just return the previous result.
            //
            // While we do a shallow comparison of objects, but we do a deep comparison of arrays.
            currentResultKeys_1.every(function (key) {
                return areNestedArrayItemsStrictlyEqual(resultFields[key], idValue.previousResult[key]);
            });
        if (sameAsPreviousResult) {
            return idValue.previousResult;
        }
    }
    resultFields[ID_KEY] = idValue.id;
    return resultFields;
}
/**
 * Compare all the items to see if they are all referentially equal in two arrays no matter how
 * deeply nested the arrays are.
 *
 * @private
 */
function areNestedArrayItemsStrictlyEqual(a, b) {
    // If `a` and `b` are referentially equal, return true.
    if (a === b) {
        return true;
    }
    // If either `a` or `b` are not an array or not of the same length return false. `a` and `b` are
    // known to not be equal here, we checked above.
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return false;
    }
    // Otherwise let us compare all of the array items (which are potentially nested arrays!) to see
    // if they are equal.
    return a.every(function (item, i) { return areNestedArrayItemsStrictlyEqual(item, b[i]); });
}

var __assign$12 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var RecordingCache = /** @class */ (function () {
    function RecordingCache(data) {
        if (data === void 0) { data = {}; }
        this.data = data;
        this.recordedData = {};
    }
    RecordingCache.prototype.record = function (transaction) {
        transaction(this);
        var recordedData = this.recordedData;
        this.recordedData = {};
        return recordedData;
    };
    RecordingCache.prototype.toObject = function () {
        return __assign$12({}, this.data, this.recordedData);
    };
    RecordingCache.prototype.get = function (dataId) {
        if (this.recordedData.hasOwnProperty(dataId)) {
            // recording always takes precedence:
            return this.recordedData[dataId];
        }
        return this.data[dataId];
    };
    RecordingCache.prototype.set = function (dataId, value) {
        if (this.get(dataId) !== value) {
            this.recordedData[dataId] = value;
        }
    };
    RecordingCache.prototype.delete = function (dataId) {
        this.recordedData[dataId] = undefined;
    };
    RecordingCache.prototype.clear = function () {
        var _this = this;
        Object.keys(this.data).forEach(function (dataId) { return _this.delete(dataId); });
        this.recordedData = {};
    };
    RecordingCache.prototype.replace = function (newData) {
        this.clear();
        this.recordedData = __assign$12({}, newData);
    };
    return RecordingCache;
}());
function record(startingState, transaction) {
    var recordingCache = new RecordingCache(startingState);
    return recordingCache.record(transaction);
}

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$8 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var defaultConfig = {
    fragmentMatcher: new HeuristicFragmentMatcher(),
    dataIdFromObject: defaultDataIdFromObject,
    addTypename: true,
    storeFactory: defaultNormalizedCacheFactory,
};
function defaultDataIdFromObject(result) {
    if (result.__typename) {
        if (result.id !== undefined) {
            return result.__typename + ":" + result.id;
        }
        if (result._id !== undefined) {
            return result.__typename + ":" + result._id;
        }
    }
    return null;
}
var InMemoryCache = /** @class */ (function (_super) {
    __extends$5(InMemoryCache, _super);
    function InMemoryCache(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.optimistic = [];
        _this.watches = [];
        // Set this while in a transaction to prevent broadcasts...
        // don't forget to turn it back on!
        _this.silenceBroadcast = false;
        _this.config = __assign$8({}, defaultConfig, config);
        // backwards compat
        if (_this.config.customResolvers) {
            console.warn('customResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating customResolvers in the next major version.');
            _this.config.cacheRedirects = _this.config.customResolvers;
        }
        if (_this.config.cacheResolvers) {
            console.warn('cacheResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating cacheResolvers in the next major version.');
            _this.config.cacheRedirects = _this.config.cacheResolvers;
        }
        _this.addTypename = _this.config.addTypename;
        _this.data = _this.config.storeFactory();
        return _this;
    }
    InMemoryCache.prototype.restore = function (data) {
        if (data)
            this.data.replace(data);
        return this;
    };
    InMemoryCache.prototype.extract = function (optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        if (optimistic && this.optimistic.length > 0) {
            var patches = this.optimistic.map(function (opt) { return opt.data; });
            return Object.assign.apply(Object, [{}, this.data.toObject()].concat(patches));
        }
        return this.data.toObject();
    };
    InMemoryCache.prototype.read = function (query) {
        if (query.rootId && this.data.get(query.rootId) === undefined) {
            return null;
        }
        return readQueryFromStore({
            store: this.config.storeFactory(this.extract(query.optimistic)),
            query: this.transformDocument(query.query),
            variables: query.variables,
            rootId: query.rootId,
            fragmentMatcherFunction: this.config.fragmentMatcher.match,
            previousResult: query.previousResult,
            config: this.config,
        });
    };
    InMemoryCache.prototype.write = function (write) {
        writeResultToStore({
            dataId: write.dataId,
            result: write.result,
            variables: write.variables,
            document: this.transformDocument(write.query),
            store: this.data,
            dataIdFromObject: this.config.dataIdFromObject,
            fragmentMatcherFunction: this.config.fragmentMatcher.match,
        });
        this.broadcastWatches();
    };
    InMemoryCache.prototype.diff = function (query) {
        return diffQueryAgainstStore({
            store: this.config.storeFactory(this.extract(query.optimistic)),
            query: this.transformDocument(query.query),
            variables: query.variables,
            returnPartialData: query.returnPartialData,
            previousResult: query.previousResult,
            fragmentMatcherFunction: this.config.fragmentMatcher.match,
            config: this.config,
        });
    };
    InMemoryCache.prototype.watch = function (watch) {
        var _this = this;
        this.watches.push(watch);
        return function () {
            _this.watches = _this.watches.filter(function (c) { return c !== watch; });
        };
    };
    InMemoryCache.prototype.evict = function (query) {
        throw new Error("eviction is not implemented on InMemory Cache");
    };
    InMemoryCache.prototype.reset = function () {
        this.data.clear();
        this.broadcastWatches();
        return Promise.resolve();
    };
    InMemoryCache.prototype.removeOptimistic = function (id) {
        var _this = this;
        // Throw away optimistic changes of that particular mutation
        var toPerform = this.optimistic.filter(function (item) { return item.id !== id; });
        this.optimistic = [];
        // Re-run all of our optimistic data actions on top of one another.
        toPerform.forEach(function (change) {
            _this.recordOptimisticTransaction(change.transaction, change.id);
        });
        this.broadcastWatches();
    };
    InMemoryCache.prototype.performTransaction = function (transaction) {
        // TODO: does this need to be different, or is this okay for an in-memory cache?
        var alreadySilenced = this.silenceBroadcast;
        this.silenceBroadcast = true;
        transaction(this);
        if (!alreadySilenced) {
            // Don't un-silence since this is a nested transaction
            // (for example, a transaction inside an optimistic record)
            this.silenceBroadcast = false;
        }
        this.broadcastWatches();
    };
    InMemoryCache.prototype.recordOptimisticTransaction = function (transaction, id) {
        var _this = this;
        this.silenceBroadcast = true;
        var patch = record(this.extract(true), function (recordingCache) {
            // swapping data instance on 'this' is currently necessary
            // because of the current architecture
            var dataCache = _this.data;
            _this.data = recordingCache;
            _this.performTransaction(transaction);
            _this.data = dataCache;
        });
        this.optimistic.push({
            id: id,
            transaction: transaction,
            data: patch,
        });
        this.silenceBroadcast = false;
        this.broadcastWatches();
    };
    InMemoryCache.prototype.transformDocument = function (document) {
        if (this.addTypename)
            return addTypenameToDocument(document);
        return document;
    };
    InMemoryCache.prototype.readQuery = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            query: options.query,
            variables: options.variables,
            optimistic: optimistic,
        });
    };
    InMemoryCache.prototype.readFragment = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            query: this.transformDocument(getFragmentQueryDocument(options.fragment, options.fragmentName)),
            variables: options.variables,
            rootId: options.id,
            optimistic: optimistic,
        });
    };
    InMemoryCache.prototype.writeQuery = function (options) {
        this.write({
            dataId: 'ROOT_QUERY',
            result: options.data,
            query: this.transformDocument(options.query),
            variables: options.variables,
        });
    };
    InMemoryCache.prototype.writeFragment = function (options) {
        this.write({
            dataId: options.id,
            result: options.data,
            query: this.transformDocument(getFragmentQueryDocument(options.fragment, options.fragmentName)),
            variables: options.variables,
        });
    };
    InMemoryCache.prototype.broadcastWatches = function () {
        var _this = this;
        // Skip this when silenced (like inside a transaction)
        if (this.silenceBroadcast)
            return;
        // right now, we invalidate all queries whenever anything changes
        this.watches.forEach(function (c) {
            var newData = _this.diff({
                query: c.query,
                variables: c.variables,
                // TODO: previousResult isn't in the types - this will only work
                // with ObservableQuery which is in a different package
                previousResult: c.previousResult && c.previousResult(),
                optimistic: c.optimistic,
            });
            c.callback(newData);
        });
    };
    return InMemoryCache;
}(ApolloCache));



var lib$3 = Object.freeze({
	InMemoryCache: InMemoryCache,
	defaultDataIdFromObject: defaultDataIdFromObject,
	ID_KEY: ID_KEY,
	readQueryFromStore: readQueryFromStore,
	diffQueryAgainstStore: diffQueryAgainstStore,
	assertIdValue: assertIdValue,
	WriteError: WriteError,
	enhanceErrorWithDocument: enhanceErrorWithDocument,
	writeQueryToStore: writeQueryToStore,
	writeResultToStore: writeResultToStore,
	writeSelectionSetToStore: writeSelectionSetToStore,
	HeuristicFragmentMatcher: HeuristicFragmentMatcher,
	IntrospectionFragmentMatcher: IntrospectionFragmentMatcher,
	ObjectCache: ObjectCache,
	defaultNormalizedCacheFactory: defaultNormalizedCacheFactory,
	RecordingCache: RecordingCache,
	record: record
});

var __assign$13 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var defaultHttpOptions = {
    includeQuery: true,
    includeExtensions: false,
};
var defaultHeaders = {
    // headers are case insensitive (https://stackoverflow.com/a/5259004)
    accept: '*/*',
    'content-type': 'application/json',
};
var defaultOptions = {
    method: 'POST',
};
var fallbackHttpConfig = {
    http: defaultHttpOptions,
    headers: defaultHeaders,
    options: defaultOptions,
};
var throwServerError = function (response, result, message) {
    var error = new Error(message);
    error.response = response;
    error.statusCode = response.status;
    error.result = result;
    throw error;
};
//TODO: when conditional types come in ts 2.8, operations should be a generic type that extends Operation | Array<Operation>
var parseAndCheckHttpResponse = function (operations) { return function (response) {
    return (response
        .text()
        .then(function (bodyText) {
        try {
            return JSON.parse(bodyText);
        }
        catch (err) {
            var parseError = err;
            parseError.response = response;
            parseError.statusCode = response.status;
            parseError.bodyText = bodyText;
            return Promise.reject(parseError);
        }
    })
        .then(function (result) {
        if (response.status >= 300) {
            //Network error
            throwServerError(response, result, "Response not successful: Received status code " + response.status);
        }
        //TODO should really error per response in a Batch based on properties
        //    - could be done in a validation link
        if (!Array.isArray(result) &&
            !result.hasOwnProperty('data') &&
            !result.hasOwnProperty('errors')) {
            //Data error
            throwServerError(response, result, "Server response was missing for query '" + (Array.isArray(operations)
                ? operations.map(function (op) { return op.operationName; })
                : operations.operationName) + "'.");
        }
        return result;
    }));
}; };
var checkFetcher = function (fetcher) {
    if (!fetcher && typeof fetch === 'undefined') {
        var library = 'unfetch';
        if (typeof window === 'undefined')
            library = 'node-fetch';
        throw new Error("\nfetch is not found globally and no fetcher passed, to fix pass a fetch for\nyour environment like https://www.npmjs.com/package/" + library + ".\n\nFor example:\nimport fetch from '" + library + "';\nimport { createHttpLink } from 'apollo-link-http';\n\nconst link = createHttpLink({ uri: '/graphql', fetch: fetch });");
    }
};
var createSignalIfSupported = function () {
    if (typeof AbortController === 'undefined')
        return { controller: false, signal: false };
    var controller = new AbortController();
    var signal = controller.signal;
    return { controller: controller, signal: signal };
};
var selectHttpOptionsAndBody = function (operation, fallbackConfig) {
    var configs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        configs[_i - 2] = arguments[_i];
    }
    var options = __assign$13({}, fallbackConfig.options, { headers: fallbackConfig.headers, credentials: fallbackConfig.credentials });
    var http = fallbackConfig.http;
    /*
     * use the rest of the configs to populate the options
     * configs later in the list will overwrite earlier fields
     */
    configs.forEach(function (config) {
        options = __assign$13({}, options, config.options, { headers: __assign$13({}, options.headers, config.headers) });
        if (config.credentials)
            options.credentials = config.credentials;
        http = __assign$13({}, http, config.http);
    });
    //The body depends on the http options
    var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
    var body = { operationName: operationName, variables: variables };
    if (http.includeExtensions)
        body.extensions = extensions;
    // not sending the query (i.e persisted queries)
    if (http.includeQuery)
        body.query = printer_1(query);
    return {
        options: options,
        body: body,
    };
};
var serializeFetchParameter = function (p, label) {
    var serialized;
    try {
        serialized = JSON.stringify(p);
    }
    catch (e) {
        var parseError = new Error("Network request failed. " + label + " is not serializable: " + e.message);
        parseError.parseError = e;
        throw parseError;
    }
    return serialized;
};
//selects "/graphql" by default
var selectURI = function (operation, fallbackURI) {
    var context = operation.getContext();
    var contextURI = context.uri;
    if (contextURI) {
        return contextURI;
    }
    else if (typeof fallbackURI === 'function') {
        return fallbackURI(operation);
    }
    else {
        return fallbackURI || '/graphql';
    }
};

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var createHttpLink = function (linkOptions) {
    if (linkOptions === void 0) { linkOptions = {}; }
    var _a = linkOptions.uri, uri = _a === void 0 ? '/graphql' : _a, 
    // use default global fetch is nothing passed in
    fetcher = linkOptions.fetch, includeExtensions = linkOptions.includeExtensions, useGETForQueries = linkOptions.useGETForQueries, requestOptions = __rest(linkOptions, ["uri", "fetch", "includeExtensions", "useGETForQueries"]);
    // dev warnings to ensure fetch is present
    checkFetcher(fetcher);
    //fetcher is set here rather than the destructuring to ensure fetch is
    //declared before referencing it. Reference in the destructuring would cause
    //a ReferenceError
    if (!fetcher) {
        fetcher = fetch;
    }
    var linkConfig = {
        http: { includeExtensions: includeExtensions },
        options: requestOptions.fetchOptions,
        credentials: requestOptions.credentials,
        headers: requestOptions.headers,
    };
    return new ApolloLink(function (operation) {
        var chosenURI = selectURI(operation, uri);
        var context = operation.getContext();
        var contextConfig = {
            http: context.http,
            options: context.fetchOptions,
            credentials: context.credentials,
            headers: context.headers,
        };
        //uses fallback, link, and then context to build options
        var _a = selectHttpOptionsAndBody(operation, fallbackHttpConfig, linkConfig, contextConfig), options = _a.options, body = _a.body;
        var controller;
        if (!options.signal) {
            var _b = createSignalIfSupported(), _controller = _b.controller, signal = _b.signal;
            controller = _controller;
            if (controller)
                options.signal = signal;
        }
        // If requested, set method to GET if there are no mutations.
        var definitionIsMutation = function (d) {
            return d.kind === 'OperationDefinition' && d.operation === 'mutation';
        };
        if (useGETForQueries &&
            !operation.query.definitions.some(definitionIsMutation)) {
            options.method = 'GET';
        }
        if (options.method === 'GET') {
            var _c = rewriteURIForGET(chosenURI, body), newURI = _c.newURI, parseError = _c.parseError;
            if (parseError) {
                return fromError(parseError);
            }
            chosenURI = newURI;
        }
        else {
            try {
                options.body = serializeFetchParameter(body, 'Payload');
            }
            catch (parseError) {
                return fromError(parseError);
            }
        }
        return new Observable$2(function (observer) {
            fetcher(chosenURI, options)
                .then(function (response) {
                operation.setContext({ response: response });
                return response;
            })
                .then(parseAndCheckHttpResponse(operation))
                .then(function (result) {
                // we have data and can send it to back up the link chain
                observer.next(result);
                observer.complete();
                return result;
            })
                .catch(function (err) {
                // fetch was cancelled so its already been cleaned up in the unsubscribe
                if (err.name === 'AbortError')
                    return;
                // if it is a network error, BUT there is graphql result info
                // fire the next observer before calling error
                // this gives apollo-client (and react-apollo) the `graphqlErrors` and `networErrors`
                // to pass to UI
                // this should only happen if we *also* have data as part of the response key per
                // the spec
                if (err.result && err.result.errors && err.result.data) {
                    // if we dont' call next, the UI can only show networkError because AC didn't
                    // get andy graphqlErrors
                    // this is graphql execution result info (i.e errors and possibly data)
                    // this is because there is no formal spec how errors should translate to
                    // http status codes. So an auth error (401) could have both data
                    // from a public field, errors from a private field, and a status of 401
                    // {
                    //  user { // this will have errors
                    //    firstName
                    //  }
                    //  products { // this is public so will have data
                    //    cost
                    //  }
                    // }
                    //
                    // the result of above *could* look like this:
                    // {
                    //   data: { products: [{ cost: "$10" }] },
                    //   errors: [{
                    //      message: 'your session has timed out',
                    //      path: []
                    //   }]
                    // }
                    // status code of above would be a 401
                    // in the UI you want to show data where you can, errors as data where you can
                    // and use correct http status codes
                    observer.next(err.result);
                }
                observer.error(err);
            });
            return function () {
                // XXX support canceling this request
                // https://developers.google.com/web/updates/2017/09/abortable-fetch
                if (controller)
                    controller.abort();
            };
        });
    });
};
// For GET operations, returns the given URI rewritten with parameters, or a
// parse error.
function rewriteURIForGET(chosenURI, body) {
    // Implement the standard HTTP GET serialization, plus 'extensions'. Note
    // the extra level of JSON serialization!
    var queryParams = [];
    var addQueryParam = function (key, value) {
        queryParams.push(key + "=" + encodeURIComponent(value));
    };
    if ('query' in body) {
        addQueryParam('query', body.query);
    }
    if (body.operationName) {
        addQueryParam('operationName', body.operationName);
    }
    if (body.variables) {
        var serializedVariables = void 0;
        try {
            serializedVariables = serializeFetchParameter(body.variables, 'Variables map');
        }
        catch (parseError) {
            return { parseError: parseError };
        }
        addQueryParam('variables', serializedVariables);
    }
    if (body.extensions) {
        var serializedExtensions = void 0;
        try {
            serializedExtensions = serializeFetchParameter(body.extensions, 'Extensions map');
        }
        catch (parseError) {
            return { parseError: parseError };
        }
        addQueryParam('extensions', serializedExtensions);
    }
    // Reconstruct the URI with added query params.
    // XXX This assumes that the URI is well-formed and that it doesn't
    //     already contain any of these query params. We could instead use the
    //     URL API and take a polyfill (whatwg-url@6) for older browsers that
    //     don't support URLSearchParams. Note that some browsers (and
    //     versions of whatwg-url) support URL but not URLSearchParams!
    var fragment = '', preFragment = chosenURI;
    var fragmentStart = chosenURI.indexOf('#');
    if (fragmentStart !== -1) {
        fragment = chosenURI.substr(fragmentStart);
        preFragment = chosenURI.substr(0, fragmentStart);
    }
    var queryParamsPrefix = preFragment.indexOf('?') === -1 ? '?' : '&';
    var newURI = preFragment + queryParamsPrefix + queryParams.join('&') + fragment;
    return { newURI: newURI };
}
var HttpLink = /** @class */ (function (_super) {
    __extends$7(HttpLink, _super);
    function HttpLink(opts) {
        return _super.call(this, createHttpLink(opts).request) || this;
    }
    return HttpLink;
}(ApolloLink));



var lib$4 = Object.freeze({
	createHttpLink: createHttpLink,
	HttpLink: HttpLink
});

var async = createCommonjsModule(function (module, exports) {
(function (global, factory) {
    factory(exports, lib$1);
}(commonjsGlobal, (function (exports,apolloUtilities) { 'use strict';

    var hasOwn = Object.prototype.hasOwnProperty;
    function merge(dest, src) {
        if (src !== null && typeof src === 'object') {
            Object.keys(src).forEach(function (key) {
                var srcVal = src[key];
                if (!hasOwn.call(dest, key)) {
                    dest[key] = srcVal;
                }
                else {
                    merge(dest[key], srcVal);
                }
            });
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /* Based on graphql function from graphql-js:
     *
     * graphql(
     *   schema: GraphQLSchema,
     *   requestString: string,
     *   rootValue?: ?any,
     *   contextValue?: ?any,
     *   variableValues?: ?{[key: string]: any},
     *   operationName?: ?string
     * ): Promise<GraphQLResult>
     *
     * The default export as of graphql-anywhere is sync as of 4.0,
     * but below is an exported alternative that is async.
     * In the 5.0 version, this will be the only export again
     * and it will be async
     *
     */
    function graphql$1(resolver, document, rootValue, contextValue, variableValues, execOptions) {
        if (execOptions === void 0) { execOptions = {}; }
        var mainDefinition = apolloUtilities.getMainDefinition(document);
        var fragments = apolloUtilities.getFragmentDefinitions(document);
        var fragmentMap = apolloUtilities.createFragmentMap(fragments);
        var resultMapper = execOptions.resultMapper;
        // Default matcher always matches all fragments
        var fragmentMatcher = execOptions.fragmentMatcher || (function () { return true; });
        var execContext = {
            fragmentMap: fragmentMap,
            contextValue: contextValue,
            variableValues: variableValues,
            resultMapper: resultMapper,
            resolver: resolver,
            fragmentMatcher: fragmentMatcher,
        };
        return executeSelectionSet$1(mainDefinition.selectionSet, rootValue, execContext);
    }
    function executeSelectionSet$1(selectionSet, rootValue, execContext) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fragmentMap, contextValue, variables, result, execute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fragmentMap = execContext.fragmentMap, contextValue = execContext.contextValue, variables = execContext.variableValues;
                        result = {};
                        execute = function (selection) { return __awaiter(_this, void 0, void 0, function () {
                            var fieldResult, resultFieldKey, fragment, typeCondition, fragmentResult;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!apolloUtilities.shouldInclude(selection, variables)) {
                                            // Skip this entirely
                                            return [2 /*return*/];
                                        }
                                        if (!apolloUtilities.isField(selection)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, executeField$1(selection, rootValue, execContext)];
                                    case 1:
                                        fieldResult = _a.sent();
                                        resultFieldKey = apolloUtilities.resultKeyNameFromField(selection);
                                        if (fieldResult !== undefined) {
                                            if (result[resultFieldKey] === undefined) {
                                                result[resultFieldKey] = fieldResult;
                                            }
                                            else {
                                                merge(result[resultFieldKey], fieldResult);
                                            }
                                        }
                                        return [2 /*return*/];
                                    case 2:
                                        if (apolloUtilities.isInlineFragment(selection)) {
                                            fragment = selection;
                                        }
                                        else {
                                            // This is a named fragment
                                            fragment = fragmentMap[selection.name.value];
                                            if (!fragment) {
                                                throw new Error("No fragment named " + selection.name.value);
                                            }
                                        }
                                        typeCondition = fragment.typeCondition.name.value;
                                        if (!execContext.fragmentMatcher(rootValue, typeCondition, contextValue)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, executeSelectionSet$1(fragment.selectionSet, rootValue, execContext)];
                                    case 3:
                                        fragmentResult = _a.sent();
                                        merge(result, fragmentResult);
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, Promise.all(selectionSet.selections.map(execute))];
                    case 1:
                        _a.sent();
                        if (execContext.resultMapper) {
                            return [2 /*return*/, execContext.resultMapper(result, rootValue)];
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    }
    function executeField$1(field, rootValue, execContext) {
        return __awaiter(this, void 0, void 0, function () {
            var variables, contextValue, resolver, fieldName, args, info, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = execContext.variableValues, contextValue = execContext.contextValue, resolver = execContext.resolver;
                        fieldName = field.name.value;
                        args = apolloUtilities.argumentsObjectFromField(field, variables);
                        info = {
                            isLeaf: !field.selectionSet,
                            resultKey: apolloUtilities.resultKeyNameFromField(field),
                            directives: apolloUtilities.getDirectiveInfoFromField(field, variables),
                        };
                        return [4 /*yield*/, resolver(fieldName, rootValue, args, contextValue, info)];
                    case 1:
                        result = _a.sent();
                        // Handle all scalar types here
                        if (!field.selectionSet) {
                            return [2 /*return*/, result];
                        }
                        // From here down, the field has a selection set, which means it's trying to
                        // query a GraphQLObjectType
                        if (result == null) {
                            // Basically any field in a GraphQL response can be null, or missing
                            return [2 /*return*/, result];
                        }
                        if (Array.isArray(result)) {
                            return [2 /*return*/, executeSubSelectedArray$1(field, result, execContext)];
                        }
                        // Returned value is an object, and the query has a sub-selection. Recurse.
                        return [2 /*return*/, executeSelectionSet$1(field.selectionSet, result, execContext)];
                }
            });
        });
    }
    function executeSubSelectedArray$1(field, result, execContext) {
        return Promise.all(result.map(function (item) {
            // null value in array
            if (item === null) {
                return null;
            }
            // This is a nested array, recurse
            if (Array.isArray(item)) {
                return executeSubSelectedArray$1(field, item, execContext);
            }
            // This is an object, run the selection set on it
            return executeSelectionSet$1(field.selectionSet, item, execContext);
        }));
    }

    exports.graphql = graphql$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

});

var async$1 = unwrapExports(async);

var connectionRemoveConfig$1 = {
    test: function (directive) { return directive.name.value === 'client'; },
    remove: true,
};
var removed$1 = new Map();
function removeClientSetsFromDocument(query) {
    var cached = removed$1.get(query);
    if (cached)
        return cached;
    checkDocument(query);
    var docClone = removeDirectivesFromDocument([connectionRemoveConfig$1], query);
    removed$1.set(query, docClone);
    return docClone;
}

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// import { graphql } from 'graphql-anywhere/lib/async';
const { graphql: graphql$2 } = async$1;
var capitalizeFirstLetter = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };
var withClientState = function (clientStateConfig) {
    if (clientStateConfig === void 0) { clientStateConfig = { resolvers: {}, defaults: {} }; }
    var resolvers = clientStateConfig.resolvers, defaults = clientStateConfig.defaults, cache = clientStateConfig.cache, typeDefs = clientStateConfig.typeDefs;
    if (cache && defaults) {
        cache.writeData({ data: defaults });
    }
    return new (function (_super) {
        __extends$8(StateLink, _super);
        function StateLink() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StateLink.prototype.writeDefaults = function () {
            if (cache && defaults) {
                cache.writeData({ data: defaults });
            }
        };
        StateLink.prototype.request = function (operation, forward) {
            if (forward === void 0) { forward = function () { return Observable$2.of({ data: {} }); }; }
            if (typeDefs) {
                var directives_1 = 'directive @client on FIELD';
                var definition_1 = typeof typeDefs === 'string'
                    ? typeDefs
                    : typeDefs.map(function (typeDef) { return typeDef.trim(); }).join('\n');
                operation.setContext(function (_a) {
                    var _b = _a.schemas, schemas = _b === void 0 ? [] : _b;
                    return ({
                        schemas: schemas.concat([{ definition: definition_1, directives: directives_1 }]),
                    });
                });
            }
            var isClient = hasDirectives(['client'], operation.query);
            if (!isClient)
                return forward(operation);
            var server = removeClientSetsFromDocument(operation.query);
            var query = operation.query;
            var type = capitalizeFirstLetter((getMainDefinition(query) || {}).operation) || 'Query';
            var resolver = function (fieldName, rootValue, args, context, info) {
                if (rootValue === void 0) { rootValue = {}; }
                var fieldValue = rootValue[info.resultKey];
                if (fieldValue !== undefined)
                    return fieldValue;
                var resolverMap = resolvers[rootValue.__typename || type];
                if (resolverMap) {
                    var resolve = resolverMap[fieldName];
                    if (resolve)
                        return resolve(rootValue, args, context, info);
                }
                return defaults[fieldName];
            };
            return new Observable$2(function (observer) {
                if (server)
                    operation.query = server;
                var obs = server && forward
                    ? forward(operation)
                    : Observable$2.of({
                        data: {},
                    });
                var observerErrorHandler = observer.error.bind(observer);
                var sub = obs.subscribe({
                    next: function (_a) {
                        var data = _a.data, errors = _a.errors;
                        var context = operation.getContext();
                        graphql$2(resolver, query, data, context, operation.variables)
                            .then(function (nextData) {
                            observer.next({
                                data: nextData,
                                errors: errors,
                            });
                            observer.complete();
                        })
                            .catch(observerErrorHandler);
                    },
                    error: observerErrorHandler,
                });
                return function () {
                    if (sub)
                        sub.unsubscribe();
                };
            });
        };
        return StateLink;
    }(ApolloLink))();
};



var lib$5 = Object.freeze({
	withClientState: withClientState
});

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var onError = function (errorHandler) {
    return new ApolloLink(function (operation, forward) {
        return new Observable$2(function (observer) {
            var sub;
            try {
                sub = forward(operation).subscribe({
                    next: function (result) {
                        if (result.errors) {
                            errorHandler({
                                graphQLErrors: result.errors,
                                response: result,
                                operation: operation,
                            });
                        }
                        observer.next(result);
                    },
                    error: function (networkError) {
                        errorHandler({
                            operation: operation,
                            networkError: networkError,
                            //Network errors can return GraphQL errors on for example a 403
                            graphQLErrors: networkError.result && networkError.result.errors,
                        });
                        observer.error(networkError);
                    },
                    complete: observer.complete.bind(observer),
                });
            }
            catch (e) {
                errorHandler({ networkError: e, operation: operation });
                observer.error(e);
            }
            return function () {
                if (sub)
                    sub.unsubscribe();
            };
        });
    });
};
var ErrorLink = /** @class */ (function (_super) {
    __extends$9(ErrorLink, _super);
    function ErrorLink(errorHandler) {
        var _this = _super.call(this) || this;
        _this.link = onError(errorHandler);
        return _this;
    }
    ErrorLink.prototype.request = function (operation, forward) {
        return this.link.request(operation, forward);
    };
    return ErrorLink;
}(ApolloLink));



var lib$6 = Object.freeze({
	onError: onError,
	ErrorLink: ErrorLink
});

var invariant_1 = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = invariant;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function invariant(condition, message) {
  /* istanbul ignore else */
  if (!condition) {
    throw new Error(message);
  }
}
});

unwrapExports(invariant_1);

var source = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Source = undefined;



var _invariant2 = _interopRequireDefault(invariant_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                           *
                                                                                                                                                           * This source code is licensed under the MIT license found in the
                                                                                                                                                           * LICENSE file in the root directory of this source tree.
                                                                                                                                                           *
                                                                                                                                                           *  strict
                                                                                                                                                           */

/**
 * A representation of source input to GraphQL.
 * `name` and `locationOffset` are optional. They are useful for clients who
 * store GraphQL documents in source files; for example, if the GraphQL input
 * starts at line 40 in a file named Foo.graphql, it might be useful for name to
 * be "Foo.graphql" and location to be `{ line: 40, column: 0 }`.
 * line and column in locationOffset are 1-indexed
 */
var Source = exports.Source = function Source(body, name, locationOffset) {
  _classCallCheck(this, Source);

  this.body = body;
  this.name = name || 'GraphQL request';
  this.locationOffset = locationOffset || { line: 1, column: 1 };
  !(this.locationOffset.line > 0) ? (0, _invariant2.default)(0, 'line in locationOffset is 1-indexed and must be positive') : void 0;
  !(this.locationOffset.column > 0) ? (0, _invariant2.default)(0, 'column in locationOffset is 1-indexed and must be positive') : void 0;
};
});

unwrapExports(source);

var location = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocation = getLocation;


/**
 * Takes a Source and a UTF-8 character offset, and returns the corresponding
 * line and column as a SourceLocation.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function getLocation(source, position) {
  var lineRegexp = /\r\n|[\n\r]/g;
  var line = 1;
  var column = position + 1;
  var match = void 0;
  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
    line += 1;
    column = position + 1 - (match.index + match[0].length);
  }
  return { line: line, column: column };
}

/**
 * Represents a location in a Source.
 */
});

unwrapExports(location);

var printError_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printError = printError;



/**
 * Prints a GraphQLError to a string, representing useful location information
 * about the error's position in the source.
 */
function printError(error) {
  var printedLocations = [];
  if (error.nodes) {
    error.nodes.forEach(function (node) {
      if (node.loc) {
        printedLocations.push(highlightSourceAtLocation(node.loc.source, (0, location.getLocation)(node.loc.source, node.loc.start)));
      }
    });
  } else if (error.source && error.locations) {
    var source = error.source;
    error.locations.forEach(function (location$$1) {
      printedLocations.push(highlightSourceAtLocation(source, location$$1));
    });
  }
  return printedLocations.length === 0 ? error.message : [error.message].concat(printedLocations).join('\n\n') + '\n';
}

/**
 * Render a helpful description of the location of the error in the GraphQL
 * Source document.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function highlightSourceAtLocation(source, location$$1) {
  var line = location$$1.line;
  var lineOffset = source.locationOffset.line - 1;
  var columnOffset = getColumnOffset(source, location$$1);
  var contextLine = line + lineOffset;
  var contextColumn = location$$1.column + columnOffset;
  var prevLineNum = (contextLine - 1).toString();
  var lineNum = contextLine.toString();
  var nextLineNum = (contextLine + 1).toString();
  var padLen = nextLineNum.length;
  var lines = source.body.split(/\r\n|[\n\r]/g);
  lines[0] = whitespace(source.locationOffset.column - 1) + lines[0];
  var outputLines = [source.name + ' (' + contextLine + ':' + contextColumn + ')', line >= 2 && lpad(padLen, prevLineNum) + ': ' + lines[line - 2], lpad(padLen, lineNum) + ': ' + lines[line - 1], whitespace(2 + padLen + contextColumn - 1) + '^', line < lines.length && lpad(padLen, nextLineNum) + ': ' + lines[line]];
  return outputLines.filter(Boolean).join('\n');
}

function getColumnOffset(source, location$$1) {
  return location$$1.line === 1 ? source.locationOffset.column - 1 : 0;
}

function whitespace(len) {
  return Array(len + 1).join(' ');
}

function lpad(len, str) {
  return whitespace(len - str.length) + str;
}
});

unwrapExports(printError_1);

var GraphQLError_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLError = GraphQLError;





/**
 * A GraphQLError describes an Error found during the parse, validate, or
 * execute phases of performing a GraphQL operation. In addition to a message
 * and stack trace, it also includes information about the locations in a
 * GraphQL document and/or execution result that correspond to the Error.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function GraphQLError( // eslint-disable-line no-redeclare
message, nodes, source, positions, path, originalError, extensions) {
  // Compute list of blame nodes.
  var _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [nodes] : undefined;

  // Compute locations in the source for the given nodes/positions.
  var _source = source;
  if (!_source && _nodes) {
    var node = _nodes[0];
    _source = node && node.loc && node.loc.source;
  }

  var _positions = positions;
  if (!_positions && _nodes) {
    _positions = _nodes.reduce(function (list, node) {
      if (node.loc) {
        list.push(node.loc.start);
      }
      return list;
    }, []);
  }
  if (_positions && _positions.length === 0) {
    _positions = undefined;
  }

  var _locations = void 0;
  if (positions && source) {
    _locations = positions.map(function (pos) {
      return (0, location.getLocation)(source, pos);
    });
  } else if (_nodes) {
    _locations = _nodes.reduce(function (list, node) {
      if (node.loc) {
        list.push((0, location.getLocation)(node.loc.source, node.loc.start));
      }
      return list;
    }, []);
  }

  Object.defineProperties(this, {
    message: {
      value: message,
      // By being enumerable, JSON.stringify will include `message` in the
      // resulting output. This ensures that the simplest possible GraphQL
      // service adheres to the spec.
      enumerable: true,
      writable: true
    },
    locations: {
      // Coercing falsey values to undefined ensures they will not be included
      // in JSON.stringify() when not provided.
      value: _locations || undefined,
      // By being enumerable, JSON.stringify will include `locations` in the
      // resulting output. This ensures that the simplest possible GraphQL
      // service adheres to the spec.
      enumerable: true
    },
    path: {
      // Coercing falsey values to undefined ensures they will not be included
      // in JSON.stringify() when not provided.
      value: path || undefined,
      // By being enumerable, JSON.stringify will include `path` in the
      // resulting output. This ensures that the simplest possible GraphQL
      // service adheres to the spec.
      enumerable: true
    },
    nodes: {
      value: _nodes || undefined
    },
    source: {
      value: _source || undefined
    },
    positions: {
      value: _positions || undefined
    },
    originalError: {
      value: originalError
    },
    extensions: {
      value: extensions || originalError && originalError.extensions
    }
  });

  // Include (non-enumerable) stack trace.
  if (originalError && originalError.stack) {
    Object.defineProperty(this, 'stack', {
      value: originalError.stack,
      writable: true,
      configurable: true
    });
  } else if (Error.captureStackTrace) {
    Error.captureStackTrace(this, GraphQLError);
  } else {
    Object.defineProperty(this, 'stack', {
      value: Error().stack,
      writable: true,
      configurable: true
    });
  }
}

GraphQLError.prototype = Object.create(Error.prototype, {
  constructor: { value: GraphQLError },
  name: { value: 'GraphQLError' },
  toString: {
    value: function toString() {
      return (0, printError_1.printError)(this);
    }
  }
});
});

unwrapExports(GraphQLError_1);

var syntaxError_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syntaxError = syntaxError;



/**
 * Produces a GraphQLError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function syntaxError(source, position, description) {
  return new GraphQLError_1.GraphQLError('Syntax Error: ' + description, undefined, source, [position]);
}
});

unwrapExports(syntaxError_1);

var locatedError_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.locatedError = locatedError;



/**
 * Given an arbitrary Error, presumably thrown while attempting to execute a
 * GraphQL operation, produce a new GraphQLError aware of the location in the
 * document responsible for the original Error.
 */
function locatedError(originalError, nodes, path) {
  // Note: this uses a brand-check to support GraphQL errors originating from
  // other contexts.
  // $FlowFixMe(>=0.68.0)
  if (originalError && Array.isArray(originalError.path)) {
    return originalError;
  }

  return new GraphQLError_1.GraphQLError(originalError && originalError.message, originalError && originalError.nodes || nodes, originalError && originalError.source, originalError && originalError.positions, path, originalError);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   *  strict
   */
});

unwrapExports(locatedError_1);

var formatError_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * This source code is licensed under the MIT license found in the
                                                                                                                                                                                                                                                                   * LICENSE file in the root directory of this source tree.
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   *  strict
                                                                                                                                                                                                                                                                   */

exports.formatError = formatError;



var _invariant2 = _interopRequireDefault(invariant_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a GraphQLError, format it according to the rules described by the
 * Response Format, Errors section of the GraphQL Specification.
 */
function formatError(error) {
  !error ? (0, _invariant2.default)(0, 'Received null or undefined error.') : void 0;
  return _extends({}, error.extensions, {
    message: error.message || 'An unknown error occurred.',
    locations: error.locations,
    path: error.path
  });
}
});

unwrapExports(formatError_1);

var error = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});



Object.defineProperty(exports, 'GraphQLError', {
  enumerable: true,
  get: function get() {
    return GraphQLError_1.GraphQLError;
  }
});



Object.defineProperty(exports, 'syntaxError', {
  enumerable: true,
  get: function get() {
    return syntaxError_1.syntaxError;
  }
});



Object.defineProperty(exports, 'locatedError', {
  enumerable: true,
  get: function get() {
    return locatedError_1.locatedError;
  }
});



Object.defineProperty(exports, 'printError', {
  enumerable: true,
  get: function get() {
    return printError_1.printError;
  }
});



Object.defineProperty(exports, 'formatError', {
  enumerable: true,
  get: function get() {
    return formatError_1.formatError;
  }
});
});

unwrapExports(error);

var blockStringValue_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = blockStringValue;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

/**
 * Produces the value of a block string from its parsed raw value, similar to
 * Coffeescript's block string, Python's docstring trim or Ruby's strip_heredoc.
 *
 * This implements the GraphQL spec's BlockStringValue() static algorithm.
 */
function blockStringValue(rawString) {
  // Expand a block string's raw value into independent lines.
  var lines = rawString.split(/\r\n|[\n\r]/g);

  // Remove common indentation from all lines but first.
  var commonIndent = null;
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i];
    var indent = leadingWhitespace(line);
    if (indent < line.length && (commonIndent === null || indent < commonIndent)) {
      commonIndent = indent;
      if (commonIndent === 0) {
        break;
      }
    }
  }

  if (commonIndent) {
    for (var _i = 1; _i < lines.length; _i++) {
      lines[_i] = lines[_i].slice(commonIndent);
    }
  }

  // Remove leading and trailing blank lines.
  while (lines.length > 0 && isBlank(lines[0])) {
    lines.shift();
  }
  while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
    lines.pop();
  }

  // Return a string of the lines joined with U+000A.
  return lines.join('\n');
}

function leadingWhitespace(str) {
  var i = 0;
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) {
    i++;
  }
  return i;
}

function isBlank(str) {
  return leadingWhitespace(str) === str.length;
}
});

unwrapExports(blockStringValue_1);

var lexer = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenKind = undefined;
exports.createLexer = createLexer;
exports.getTokenDesc = getTokenDesc;





var _blockStringValue2 = _interopRequireDefault(blockStringValue_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a Source object, this returns a Lexer for that source.
 * A Lexer is a stateful stream generator in that every time
 * it is advanced, it returns the next token in the Source. Assuming the
 * source lexes, the final Token emitted by the lexer will be of kind
 * EOF, after which the lexer will repeatedly return the same EOF token
 * whenever called.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function createLexer(source, options) {
  var startOfFileToken = new Tok(TokenKind.SOF, 0, 0, 0, 0, null);
  var lexer = {
    source: source,
    options: options,
    lastToken: startOfFileToken,
    token: startOfFileToken,
    line: 1,
    lineStart: 0,
    advance: advanceLexer,
    lookahead: lookahead
  };
  return lexer;
}

function advanceLexer() {
  this.lastToken = this.token;
  var token = this.token = this.lookahead();
  return token;
}

function lookahead() {
  var token = this.token;
  if (token.kind !== TokenKind.EOF) {
    do {
      // Note: next is only mutable during parsing, so we cast to allow this.
      token = token.next || (token.next = readToken(this, token));
    } while (token.kind === TokenKind.COMMENT);
  }
  return token;
}

/**
 * The return type of createLexer.
 */


/**
 * An exported enum describing the different kinds of tokens that the
 * lexer emits.
 */
var TokenKind = exports.TokenKind = Object.freeze({
  SOF: '<SOF>',
  EOF: '<EOF>',
  BANG: '!',
  DOLLAR: '$',
  AMP: '&',
  PAREN_L: '(',
  PAREN_R: ')',
  SPREAD: '...',
  COLON: ':',
  EQUALS: '=',
  AT: '@',
  BRACKET_L: '[',
  BRACKET_R: ']',
  BRACE_L: '{',
  PIPE: '|',
  BRACE_R: '}',
  NAME: 'Name',
  INT: 'Int',
  FLOAT: 'Float',
  STRING: 'String',
  BLOCK_STRING: 'BlockString',
  COMMENT: 'Comment'
});

/**
 * The enum type representing the token kinds values.
 */


/**
 * A helper function to describe a token as a string for debugging
 */
function getTokenDesc(token) {
  var value = token.value;
  return value ? token.kind + ' "' + value + '"' : token.kind;
}

var charCodeAt = String.prototype.charCodeAt;
var slice = String.prototype.slice;

/**
 * Helper function for constructing the Token object.
 */
function Tok(kind, start, end, line, column, prev, value) {
  this.kind = kind;
  this.start = start;
  this.end = end;
  this.line = line;
  this.column = column;
  this.value = value;
  this.prev = prev;
  this.next = null;
}

// Print a simplified form when appearing in JSON/util.inspect.
Tok.prototype.toJSON = Tok.prototype.inspect = function toJSON() {
  return {
    kind: this.kind,
    value: this.value,
    line: this.line,
    column: this.column
  };
};

function printCharCode(code) {
  return (
    // NaN/undefined represents access beyond the end of the file.
    isNaN(code) ? TokenKind.EOF : // Trust JSON for ASCII.
    code < 0x007f ? JSON.stringify(String.fromCharCode(code)) : // Otherwise print the escaped form.
    '"\\u' + ('00' + code.toString(16).toUpperCase()).slice(-4) + '"'
  );
}

/**
 * Gets the next token from the source starting at the given position.
 *
 * This skips over whitespace and comments until it finds the next lexable
 * token, then lexes punctuators immediately or calls the appropriate helper
 * function for more complicated tokens.
 */
function readToken(lexer, prev) {
  var source = lexer.source;
  var body = source.body;
  var bodyLength = body.length;

  var pos = positionAfterWhitespace(body, prev.end, lexer);
  var line = lexer.line;
  var col = 1 + pos - lexer.lineStart;

  if (pos >= bodyLength) {
    return new Tok(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
  }

  var code = charCodeAt.call(body, pos);

  // SourceCharacter
  if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
    throw (0, error.syntaxError)(source, pos, 'Cannot contain the invalid character ' + printCharCode(code) + '.');
  }

  switch (code) {
    // !
    case 33:
      return new Tok(TokenKind.BANG, pos, pos + 1, line, col, prev);
    // #
    case 35:
      return readComment(source, pos, line, col, prev);
    // $
    case 36:
      return new Tok(TokenKind.DOLLAR, pos, pos + 1, line, col, prev);
    // &
    case 38:
      return new Tok(TokenKind.AMP, pos, pos + 1, line, col, prev);
    // (
    case 40:
      return new Tok(TokenKind.PAREN_L, pos, pos + 1, line, col, prev);
    // )
    case 41:
      return new Tok(TokenKind.PAREN_R, pos, pos + 1, line, col, prev);
    // .
    case 46:
      if (charCodeAt.call(body, pos + 1) === 46 && charCodeAt.call(body, pos + 2) === 46) {
        return new Tok(TokenKind.SPREAD, pos, pos + 3, line, col, prev);
      }
      break;
    // :
    case 58:
      return new Tok(TokenKind.COLON, pos, pos + 1, line, col, prev);
    // =
    case 61:
      return new Tok(TokenKind.EQUALS, pos, pos + 1, line, col, prev);
    // @
    case 64:
      return new Tok(TokenKind.AT, pos, pos + 1, line, col, prev);
    // [
    case 91:
      return new Tok(TokenKind.BRACKET_L, pos, pos + 1, line, col, prev);
    // ]
    case 93:
      return new Tok(TokenKind.BRACKET_R, pos, pos + 1, line, col, prev);
    // {
    case 123:
      return new Tok(TokenKind.BRACE_L, pos, pos + 1, line, col, prev);
    // |
    case 124:
      return new Tok(TokenKind.PIPE, pos, pos + 1, line, col, prev);
    // }
    case 125:
      return new Tok(TokenKind.BRACE_R, pos, pos + 1, line, col, prev);
    // A-Z _ a-z
    case 65:
    case 66:
    case 67:
    case 68:
    case 69:
    case 70:
    case 71:
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 77:
    case 78:
    case 79:
    case 80:
    case 81:
    case 82:
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
    case 90:
    case 95:
    case 97:
    case 98:
    case 99:
    case 100:
    case 101:
    case 102:
    case 103:
    case 104:
    case 105:
    case 106:
    case 107:
    case 108:
    case 109:
    case 110:
    case 111:
    case 112:
    case 113:
    case 114:
    case 115:
    case 116:
    case 117:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
      return readName(source, pos, line, col, prev);
    // - 0-9
    case 45:
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return readNumber(source, pos, code, line, col, prev);
    // "
    case 34:
      if (charCodeAt.call(body, pos + 1) === 34 && charCodeAt.call(body, pos + 2) === 34) {
        return readBlockString(source, pos, line, col, prev);
      }
      return readString(source, pos, line, col, prev);
  }

  throw (0, error.syntaxError)(source, pos, unexpectedCharacterMessage(code));
}

/**
 * Report a message that an unexpected character was encountered.
 */
function unexpectedCharacterMessage(code) {
  if (code === 39) {
    // '
    return "Unexpected single quote character ('), did you mean to use " + 'a double quote (")?';
  }

  return 'Cannot parse the unexpected character ' + printCharCode(code) + '.';
}

/**
 * Reads from body starting at startPosition until it finds a non-whitespace
 * or commented character, then returns the position of that character for
 * lexing.
 */
function positionAfterWhitespace(body, startPosition, lexer) {
  var bodyLength = body.length;
  var position = startPosition;
  while (position < bodyLength) {
    var code = charCodeAt.call(body, position);
    // tab | space | comma | BOM
    if (code === 9 || code === 32 || code === 44 || code === 0xfeff) {
      ++position;
    } else if (code === 10) {
      // new line
      ++position;
      ++lexer.line;
      lexer.lineStart = position;
    } else if (code === 13) {
      // carriage return
      if (charCodeAt.call(body, position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      ++lexer.line;
      lexer.lineStart = position;
    } else {
      break;
    }
  }
  return position;
}

/**
 * Reads a comment token from the source file.
 *
 * #[\u0009\u0020-\uFFFF]*
 */
function readComment(source, start, line, col, prev) {
  var body = source.body;
  var code = void 0;
  var position = start;

  do {
    code = charCodeAt.call(body, ++position);
  } while (code !== null && (
  // SourceCharacter but not LineTerminator
  code > 0x001f || code === 0x0009));

  return new Tok(TokenKind.COMMENT, start, position, line, col, prev, slice.call(body, start + 1, position));
}

/**
 * Reads a number token from the source file, either a float
 * or an int depending on whether a decimal point appears.
 *
 * Int:   -?(0|[1-9][0-9]*)
 * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
 */
function readNumber(source, start, firstCode, line, col, prev) {
  var body = source.body;
  var code = firstCode;
  var position = start;
  var isFloat = false;

  if (code === 45) {
    // -
    code = charCodeAt.call(body, ++position);
  }

  if (code === 48) {
    // 0
    code = charCodeAt.call(body, ++position);
    if (code >= 48 && code <= 57) {
      throw (0, error.syntaxError)(source, position, 'Invalid number, unexpected digit after 0: ' + printCharCode(code) + '.');
    }
  } else {
    position = readDigits(source, position, code);
    code = charCodeAt.call(body, position);
  }

  if (code === 46) {
    // .
    isFloat = true;

    code = charCodeAt.call(body, ++position);
    position = readDigits(source, position, code);
    code = charCodeAt.call(body, position);
  }

  if (code === 69 || code === 101) {
    // E e
    isFloat = true;

    code = charCodeAt.call(body, ++position);
    if (code === 43 || code === 45) {
      // + -
      code = charCodeAt.call(body, ++position);
    }
    position = readDigits(source, position, code);
  }

  return new Tok(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, slice.call(body, start, position));
}

/**
 * Returns the new position in the source after reading digits.
 */
function readDigits(source, start, firstCode) {
  var body = source.body;
  var position = start;
  var code = firstCode;
  if (code >= 48 && code <= 57) {
    // 0 - 9
    do {
      code = charCodeAt.call(body, ++position);
    } while (code >= 48 && code <= 57); // 0 - 9
    return position;
  }
  throw (0, error.syntaxError)(source, position, 'Invalid number, expected digit but got: ' + printCharCode(code) + '.');
}

/**
 * Reads a string token from the source file.
 *
 * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
 */
function readString(source, start, line, col, prev) {
  var body = source.body;
  var position = start + 1;
  var chunkStart = position;
  var code = 0;
  var value = '';

  while (position < body.length && (code = charCodeAt.call(body, position)) !== null &&
  // not LineTerminator
  code !== 0x000a && code !== 0x000d) {
    // Closing Quote (")
    if (code === 34) {
      value += slice.call(body, chunkStart, position);
      return new Tok(TokenKind.STRING, start, position + 1, line, col, prev, value);
    }

    // SourceCharacter
    if (code < 0x0020 && code !== 0x0009) {
      throw (0, error.syntaxError)(source, position, 'Invalid character within String: ' + printCharCode(code) + '.');
    }

    ++position;
    if (code === 92) {
      // \
      value += slice.call(body, chunkStart, position - 1);
      code = charCodeAt.call(body, position);
      switch (code) {
        case 34:
          value += '"';
          break;
        case 47:
          value += '/';
          break;
        case 92:
          value += '\\';
          break;
        case 98:
          value += '\b';
          break;
        case 102:
          value += '\f';
          break;
        case 110:
          value += '\n';
          break;
        case 114:
          value += '\r';
          break;
        case 116:
          value += '\t';
          break;
        case 117:
          // u
          var charCode = uniCharCode(charCodeAt.call(body, position + 1), charCodeAt.call(body, position + 2), charCodeAt.call(body, position + 3), charCodeAt.call(body, position + 4));
          if (charCode < 0) {
            throw (0, error.syntaxError)(source, position, 'Invalid character escape sequence: ' + ('\\u' + body.slice(position + 1, position + 5) + '.'));
          }
          value += String.fromCharCode(charCode);
          position += 4;
          break;
        default:
          throw (0, error.syntaxError)(source, position, 'Invalid character escape sequence: \\' + String.fromCharCode(code) + '.');
      }
      ++position;
      chunkStart = position;
    }
  }

  throw (0, error.syntaxError)(source, position, 'Unterminated string.');
}

/**
 * Reads a block string token from the source file.
 *
 * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
 */
function readBlockString(source, start, line, col, prev) {
  var body = source.body;
  var position = start + 3;
  var chunkStart = position;
  var code = 0;
  var rawValue = '';

  while (position < body.length && (code = charCodeAt.call(body, position)) !== null) {
    // Closing Triple-Quote (""")
    if (code === 34 && charCodeAt.call(body, position + 1) === 34 && charCodeAt.call(body, position + 2) === 34) {
      rawValue += slice.call(body, chunkStart, position);
      return new Tok(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, (0, _blockStringValue2.default)(rawValue));
    }

    // SourceCharacter
    if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
      throw (0, error.syntaxError)(source, position, 'Invalid character within String: ' + printCharCode(code) + '.');
    }

    // Escape Triple-Quote (\""")
    if (code === 92 && charCodeAt.call(body, position + 1) === 34 && charCodeAt.call(body, position + 2) === 34 && charCodeAt.call(body, position + 3) === 34) {
      rawValue += slice.call(body, chunkStart, position) + '"""';
      position += 4;
      chunkStart = position;
    } else {
      ++position;
    }
  }

  throw (0, error.syntaxError)(source, position, 'Unterminated string.');
}

/**
 * Converts four hexidecimal chars to the integer that the
 * string represents. For example, uniCharCode('0','0','0','f')
 * will return 15, and uniCharCode('0','0','f','f') returns 255.
 *
 * Returns a negative number on error, if a char was invalid.
 *
 * This is implemented by noting that char2hex() returns -1 on error,
 * which means the result of ORing the char2hex() will also be negative.
 */
function uniCharCode(a, b, c, d) {
  return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
}

/**
 * Converts a hex character to its integer value.
 * '0' becomes 0, '9' becomes 9
 * 'A' becomes 10, 'F' becomes 15
 * 'a' becomes 10, 'f' becomes 15
 *
 * Returns -1 on error.
 */
function char2hex(a) {
  return a >= 48 && a <= 57 ? a - 48 // 0-9
  : a >= 65 && a <= 70 ? a - 55 // A-F
  : a >= 97 && a <= 102 ? a - 87 // a-f
  : -1;
}

/**
 * Reads an alphanumeric + underscore name from the source.
 *
 * [_A-Za-z][_0-9A-Za-z]*
 */
function readName(source, start, line, col, prev) {
  var body = source.body;
  var bodyLength = body.length;
  var position = start + 1;
  var code = 0;
  while (position !== bodyLength && (code = charCodeAt.call(body, position)) !== null && (code === 95 || // _
  code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 90 || // A-Z
  code >= 97 && code <= 122) // a-z
  ) {
    ++position;
  }
  return new Tok(TokenKind.NAME, start, position, line, col, prev, slice.call(body, start, position));
}
});

unwrapExports(lexer);

var kinds = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

/**
 * The set of allowed kind values for AST nodes.
 */
var Kind = exports.Kind = Object.freeze({
  // Name
  NAME: 'Name',

  // Document
  DOCUMENT: 'Document',
  OPERATION_DEFINITION: 'OperationDefinition',
  VARIABLE_DEFINITION: 'VariableDefinition',
  VARIABLE: 'Variable',
  SELECTION_SET: 'SelectionSet',
  FIELD: 'Field',
  ARGUMENT: 'Argument',

  // Fragments
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment',
  FRAGMENT_DEFINITION: 'FragmentDefinition',

  // Values
  INT: 'IntValue',
  FLOAT: 'FloatValue',
  STRING: 'StringValue',
  BOOLEAN: 'BooleanValue',
  NULL: 'NullValue',
  ENUM: 'EnumValue',
  LIST: 'ListValue',
  OBJECT: 'ObjectValue',
  OBJECT_FIELD: 'ObjectField',

  // Directives
  DIRECTIVE: 'Directive',

  // Types
  NAMED_TYPE: 'NamedType',
  LIST_TYPE: 'ListType',
  NON_NULL_TYPE: 'NonNullType',

  // Type System Definitions
  SCHEMA_DEFINITION: 'SchemaDefinition',
  OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',

  // Type Definitions
  SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
  OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
  FIELD_DEFINITION: 'FieldDefinition',
  INPUT_VALUE_DEFINITION: 'InputValueDefinition',
  INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
  UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
  ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
  ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
  INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',

  // Type Extensions
  SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
  OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
  INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
  UNION_TYPE_EXTENSION: 'UnionTypeExtension',
  ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
  INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension',

  // Directive Definitions
  DIRECTIVE_DEFINITION: 'DirectiveDefinition'
});

/**
 * The enum type representing the possible kind values of AST nodes.
 */
});

unwrapExports(kinds);

var directiveLocation = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

/**
 * The set of allowed directive location values.
 */
var DirectiveLocation = exports.DirectiveLocation = Object.freeze({
  // Request Definitions
  QUERY: 'QUERY',
  MUTATION: 'MUTATION',
  SUBSCRIPTION: 'SUBSCRIPTION',
  FIELD: 'FIELD',
  FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
  FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
  INLINE_FRAGMENT: 'INLINE_FRAGMENT',
  // Type System Definitions
  SCHEMA: 'SCHEMA',
  SCALAR: 'SCALAR',
  OBJECT: 'OBJECT',
  FIELD_DEFINITION: 'FIELD_DEFINITION',
  ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
  INTERFACE: 'INTERFACE',
  UNION: 'UNION',
  ENUM: 'ENUM',
  ENUM_VALUE: 'ENUM_VALUE',
  INPUT_OBJECT: 'INPUT_OBJECT',
  INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
});

/**
 * The enum type representing the directive location values.
 */
});

unwrapExports(directiveLocation);

var parser = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.parseValue = parseValue;
exports.parseType = parseType;
exports.parseConstValue = parseConstValue;
exports.parseTypeReference = parseTypeReference;
exports.parseNamedType = parseNamedType;











/**
 * Given a GraphQL source, parses it into a Document.
 * Throws GraphQLError if a syntax error is encountered.
 */


/**
 * Configuration options to control parser behavior
 */
function parse(source$$1, options) {
  var sourceObj = typeof source$$1 === 'string' ? new source.Source(source$$1) : source$$1;
  if (!(sourceObj instanceof source.Source)) {
    throw new TypeError('Must provide Source. Received: ' + String(sourceObj));
  }
  var lexer$$1 = (0, lexer.createLexer)(sourceObj, options || {});
  return parseDocument(lexer$$1);
}

/**
 * Given a string containing a GraphQL value (ex. `[42]`), parse the AST for
 * that value.
 * Throws GraphQLError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon GraphQL Values directly and
 * in isolation of complete GraphQL documents.
 *
 * Consider providing the results to the utility function: valueFromAST().
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *  strict
 */

function parseValue(source$$1, options) {
  var sourceObj = typeof source$$1 === 'string' ? new source.Source(source$$1) : source$$1;
  var lexer$$1 = (0, lexer.createLexer)(sourceObj, options || {});
  expect(lexer$$1, lexer.TokenKind.SOF);
  var value = parseValueLiteral(lexer$$1, false);
  expect(lexer$$1, lexer.TokenKind.EOF);
  return value;
}

/**
 * Given a string containing a GraphQL Type (ex. `[Int!]`), parse the AST for
 * that type.
 * Throws GraphQLError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon GraphQL Types directly and
 * in isolation of complete GraphQL documents.
 *
 * Consider providing the results to the utility function: typeFromAST().
 */
function parseType(source$$1, options) {
  var sourceObj = typeof source$$1 === 'string' ? new source.Source(source$$1) : source$$1;
  var lexer$$1 = (0, lexer.createLexer)(sourceObj, options || {});
  expect(lexer$$1, lexer.TokenKind.SOF);
  var type = parseTypeReference(lexer$$1);
  expect(lexer$$1, lexer.TokenKind.EOF);
  return type;
}

/**
 * Converts a name lex token into a name parse node.
 */
function parseName(lexer$$1) {
  var token = expect(lexer$$1, lexer.TokenKind.NAME);
  return {
    kind: kinds.Kind.NAME,
    value: token.value,
    loc: loc(lexer$$1, token)
  };
}

// Implements the parsing rules in the Document section.

/**
 * Document : Definition+
 */
function parseDocument(lexer$$1) {
  var start = lexer$$1.token;
  expect(lexer$$1, lexer.TokenKind.SOF);
  var definitions = [];
  do {
    definitions.push(parseDefinition(lexer$$1));
  } while (!skip(lexer$$1, lexer.TokenKind.EOF));

  return {
    kind: kinds.Kind.DOCUMENT,
    definitions: definitions,
    loc: loc(lexer$$1, start)
  };
}

/**
 * Definition :
 *   - ExecutableDefinition
 *   - TypeSystemDefinition
 */
function parseDefinition(lexer$$1) {
  if (peek(lexer$$1, lexer.TokenKind.NAME)) {
    switch (lexer$$1.token.value) {
      case 'query':
      case 'mutation':
      case 'subscription':
      case 'fragment':
        return parseExecutableDefinition(lexer$$1);
      case 'schema':
      case 'scalar':
      case 'type':
      case 'interface':
      case 'union':
      case 'enum':
      case 'input':
      case 'extend':
      case 'directive':
        // Note: The schema definition language is an experimental addition.
        return parseTypeSystemDefinition(lexer$$1);
    }
  } else if (peek(lexer$$1, lexer.TokenKind.BRACE_L)) {
    return parseExecutableDefinition(lexer$$1);
  } else if (peekDescription(lexer$$1)) {
    // Note: The schema definition language is an experimental addition.
    return parseTypeSystemDefinition(lexer$$1);
  }

  throw unexpected(lexer$$1);
}

/**
 * ExecutableDefinition :
 *   - OperationDefinition
 *   - FragmentDefinition
 */
function parseExecutableDefinition(lexer$$1) {
  if (peek(lexer$$1, lexer.TokenKind.NAME)) {
    switch (lexer$$1.token.value) {
      case 'query':
      case 'mutation':
      case 'subscription':
        return parseOperationDefinition(lexer$$1);

      case 'fragment':
        return parseFragmentDefinition(lexer$$1);
    }
  } else if (peek(lexer$$1, lexer.TokenKind.BRACE_L)) {
    return parseOperationDefinition(lexer$$1);
  }

  throw unexpected(lexer$$1);
}

// Implements the parsing rules in the Operations section.

/**
 * OperationDefinition :
 *  - SelectionSet
 *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
 */
function parseOperationDefinition(lexer$$1) {
  var start = lexer$$1.token;
  if (peek(lexer$$1, lexer.TokenKind.BRACE_L)) {
    return {
      kind: kinds.Kind.OPERATION_DEFINITION,
      operation: 'query',
      name: undefined,
      variableDefinitions: [],
      directives: [],
      selectionSet: parseSelectionSet(lexer$$1),
      loc: loc(lexer$$1, start)
    };
  }
  var operation = parseOperationType(lexer$$1);
  var name = void 0;
  if (peek(lexer$$1, lexer.TokenKind.NAME)) {
    name = parseName(lexer$$1);
  }
  return {
    kind: kinds.Kind.OPERATION_DEFINITION,
    operation: operation,
    name: name,
    variableDefinitions: parseVariableDefinitions(lexer$$1),
    directives: parseDirectives(lexer$$1, false),
    selectionSet: parseSelectionSet(lexer$$1),
    loc: loc(lexer$$1, start)
  };
}

/**
 * OperationType : one of query mutation subscription
 */
function parseOperationType(lexer$$1) {
  var operationToken = expect(lexer$$1, lexer.TokenKind.NAME);
  switch (operationToken.value) {
    case 'query':
      return 'query';
    case 'mutation':
      return 'mutation';
    case 'subscription':
      return 'subscription';
  }

  throw unexpected(lexer$$1, operationToken);
}

/**
 * VariableDefinitions : ( VariableDefinition+ )
 */
function parseVariableDefinitions(lexer$$1) {
  return peek(lexer$$1, lexer.TokenKind.PAREN_L) ? many(lexer$$1, lexer.TokenKind.PAREN_L, parseVariableDefinition, lexer.TokenKind.PAREN_R) : [];
}

/**
 * VariableDefinition : Variable : Type DefaultValue?
 */
function parseVariableDefinition(lexer$$1) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.VARIABLE_DEFINITION,
    variable: parseVariable(lexer$$1),
    type: (expect(lexer$$1, lexer.TokenKind.COLON), parseTypeReference(lexer$$1)),
    defaultValue: skip(lexer$$1, lexer.TokenKind.EQUALS) ? parseValueLiteral(lexer$$1, true) : undefined,
    loc: loc(lexer$$1, start)
  };
}

/**
 * Variable : $ Name
 */
function parseVariable(lexer$$1) {
  var start = lexer$$1.token;
  expect(lexer$$1, lexer.TokenKind.DOLLAR);
  return {
    kind: kinds.Kind.VARIABLE,
    name: parseName(lexer$$1),
    loc: loc(lexer$$1, start)
  };
}

/**
 * SelectionSet : { Selection+ }
 */
function parseSelectionSet(lexer$$1) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.SELECTION_SET,
    selections: many(lexer$$1, lexer.TokenKind.BRACE_L, parseSelection, lexer.TokenKind.BRACE_R),
    loc: loc(lexer$$1, start)
  };
}

/**
 * Selection :
 *   - Field
 *   - FragmentSpread
 *   - InlineFragment
 */
function parseSelection(lexer$$1) {
  return peek(lexer$$1, lexer.TokenKind.SPREAD) ? parseFragment(lexer$$1) : parseField(lexer$$1);
}

/**
 * Field : Alias? Name Arguments? Directives? SelectionSet?
 *
 * Alias : Name :
 */
function parseField(lexer$$1) {
  var start = lexer$$1.token;

  var nameOrAlias = parseName(lexer$$1);
  var alias = void 0;
  var name = void 0;
  if (skip(lexer$$1, lexer.TokenKind.COLON)) {
    alias = nameOrAlias;
    name = parseName(lexer$$1);
  } else {
    name = nameOrAlias;
  }

  return {
    kind: kinds.Kind.FIELD,
    alias: alias,
    name: name,
    arguments: parseArguments(lexer$$1, false),
    directives: parseDirectives(lexer$$1, false),
    selectionSet: peek(lexer$$1, lexer.TokenKind.BRACE_L) ? parseSelectionSet(lexer$$1) : undefined,
    loc: loc(lexer$$1, start)
  };
}

/**
 * Arguments[Const] : ( Argument[?Const]+ )
 */
function parseArguments(lexer$$1, isConst) {
  var item = isConst ? parseConstArgument : parseArgument;
  return peek(lexer$$1, lexer.TokenKind.PAREN_L) ? many(lexer$$1, lexer.TokenKind.PAREN_L, item, lexer.TokenKind.PAREN_R) : [];
}

/**
 * Argument[Const] : Name : Value[?Const]
 */
function parseArgument(lexer$$1) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.ARGUMENT,
    name: parseName(lexer$$1),
    value: (expect(lexer$$1, lexer.TokenKind.COLON), parseValueLiteral(lexer$$1, false)),
    loc: loc(lexer$$1, start)
  };
}

function parseConstArgument(lexer$$1) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.ARGUMENT,
    name: parseName(lexer$$1),
    value: (expect(lexer$$1, lexer.TokenKind.COLON), parseConstValue(lexer$$1)),
    loc: loc(lexer$$1, start)
  };
}

// Implements the parsing rules in the Fragments section.

/**
 * Corresponds to both FragmentSpread and InlineFragment in the spec.
 *
 * FragmentSpread : ... FragmentName Directives?
 *
 * InlineFragment : ... TypeCondition? Directives? SelectionSet
 */
function parseFragment(lexer$$1) {
  var start = lexer$$1.token;
  expect(lexer$$1, lexer.TokenKind.SPREAD);
  if (peek(lexer$$1, lexer.TokenKind.NAME) && lexer$$1.token.value !== 'on') {
    return {
      kind: kinds.Kind.FRAGMENT_SPREAD,
      name: parseFragmentName(lexer$$1),
      directives: parseDirectives(lexer$$1, false),
      loc: loc(lexer$$1, start)
    };
  }
  var typeCondition = void 0;
  if (lexer$$1.token.value === 'on') {
    lexer$$1.advance();
    typeCondition = parseNamedType(lexer$$1);
  }
  return {
    kind: kinds.Kind.INLINE_FRAGMENT,
    typeCondition: typeCondition,
    directives: parseDirectives(lexer$$1, false),
    selectionSet: parseSelectionSet(lexer$$1),
    loc: loc(lexer$$1, start)
  };
}

/**
 * FragmentDefinition :
 *   - fragment FragmentName on TypeCondition Directives? SelectionSet
 *
 * TypeCondition : NamedType
 */
function parseFragmentDefinition(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'fragment');
  // Experimental support for defining variables within fragments changes
  // the grammar of FragmentDefinition:
  //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet
  if (lexer$$1.options.experimentalFragmentVariables) {
    return {
      kind: kinds.Kind.FRAGMENT_DEFINITION,
      name: parseFragmentName(lexer$$1),
      variableDefinitions: parseVariableDefinitions(lexer$$1),
      typeCondition: (expectKeyword(lexer$$1, 'on'), parseNamedType(lexer$$1)),
      directives: parseDirectives(lexer$$1, false),
      selectionSet: parseSelectionSet(lexer$$1),
      loc: loc(lexer$$1, start)
    };
  }
  return {
    kind: kinds.Kind.FRAGMENT_DEFINITION,
    name: parseFragmentName(lexer$$1),
    typeCondition: (expectKeyword(lexer$$1, 'on'), parseNamedType(lexer$$1)),
    directives: parseDirectives(lexer$$1, false),
    selectionSet: parseSelectionSet(lexer$$1),
    loc: loc(lexer$$1, start)
  };
}

/**
 * FragmentName : Name but not `on`
 */
function parseFragmentName(lexer$$1) {
  if (lexer$$1.token.value === 'on') {
    throw unexpected(lexer$$1);
  }
  return parseName(lexer$$1);
}

// Implements the parsing rules in the Values section.

/**
 * Value[Const] :
 *   - [~Const] Variable
 *   - IntValue
 *   - FloatValue
 *   - StringValue
 *   - BooleanValue
 *   - NullValue
 *   - EnumValue
 *   - ListValue[?Const]
 *   - ObjectValue[?Const]
 *
 * BooleanValue : one of `true` `false`
 *
 * NullValue : `null`
 *
 * EnumValue : Name but not `true`, `false` or `null`
 */
function parseValueLiteral(lexer$$1, isConst) {
  var token = lexer$$1.token;
  switch (token.kind) {
    case lexer.TokenKind.BRACKET_L:
      return parseList(lexer$$1, isConst);
    case lexer.TokenKind.BRACE_L:
      return parseObject(lexer$$1, isConst);
    case lexer.TokenKind.INT:
      lexer$$1.advance();
      return {
        kind: kinds.Kind.INT,
        value: token.value,
        loc: loc(lexer$$1, token)
      };
    case lexer.TokenKind.FLOAT:
      lexer$$1.advance();
      return {
        kind: kinds.Kind.FLOAT,
        value: token.value,
        loc: loc(lexer$$1, token)
      };
    case lexer.TokenKind.STRING:
    case lexer.TokenKind.BLOCK_STRING:
      return parseStringLiteral(lexer$$1);
    case lexer.TokenKind.NAME:
      if (token.value === 'true' || token.value === 'false') {
        lexer$$1.advance();
        return {
          kind: kinds.Kind.BOOLEAN,
          value: token.value === 'true',
          loc: loc(lexer$$1, token)
        };
      } else if (token.value === 'null') {
        lexer$$1.advance();
        return {
          kind: kinds.Kind.NULL,
          loc: loc(lexer$$1, token)
        };
      }
      lexer$$1.advance();
      return {
        kind: kinds.Kind.ENUM,
        value: token.value,
        loc: loc(lexer$$1, token)
      };
    case lexer.TokenKind.DOLLAR:
      if (!isConst) {
        return parseVariable(lexer$$1);
      }
      break;
  }
  throw unexpected(lexer$$1);
}

function parseStringLiteral(lexer$$1) {
  var token = lexer$$1.token;
  lexer$$1.advance();
  return {
    kind: kinds.Kind.STRING,
    value: token.value,
    block: token.kind === lexer.TokenKind.BLOCK_STRING,
    loc: loc(lexer$$1, token)
  };
}

function parseConstValue(lexer$$1) {
  return parseValueLiteral(lexer$$1, true);
}

function parseValueValue(lexer$$1) {
  return parseValueLiteral(lexer$$1, false);
}

/**
 * ListValue[Const] :
 *   - [ ]
 *   - [ Value[?Const]+ ]
 */
function parseList(lexer$$1, isConst) {
  var start = lexer$$1.token;
  var item = isConst ? parseConstValue : parseValueValue;
  return {
    kind: kinds.Kind.LIST,
    values: any(lexer$$1, lexer.TokenKind.BRACKET_L, item, lexer.TokenKind.BRACKET_R),
    loc: loc(lexer$$1, start)
  };
}

/**
 * ObjectValue[Const] :
 *   - { }
 *   - { ObjectField[?Const]+ }
 */
function parseObject(lexer$$1, isConst) {
  var start = lexer$$1.token;
  expect(lexer$$1, lexer.TokenKind.BRACE_L);
  var fields = [];
  while (!skip(lexer$$1, lexer.TokenKind.BRACE_R)) {
    fields.push(parseObjectField(lexer$$1, isConst));
  }
  return {
    kind: kinds.Kind.OBJECT,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ObjectField[Const] : Name : Value[?Const]
 */
function parseObjectField(lexer$$1, isConst) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.OBJECT_FIELD,
    name: parseName(lexer$$1),
    value: (expect(lexer$$1, lexer.TokenKind.COLON), parseValueLiteral(lexer$$1, isConst)),
    loc: loc(lexer$$1, start)
  };
}

// Implements the parsing rules in the Directives section.

/**
 * Directives[Const] : Directive[?Const]+
 */
function parseDirectives(lexer$$1, isConst) {
  var directives = [];
  while (peek(lexer$$1, lexer.TokenKind.AT)) {
    directives.push(parseDirective(lexer$$1, isConst));
  }
  return directives;
}

/**
 * Directive[Const] : @ Name Arguments[?Const]?
 */
function parseDirective(lexer$$1, isConst) {
  var start = lexer$$1.token;
  expect(lexer$$1, lexer.TokenKind.AT);
  return {
    kind: kinds.Kind.DIRECTIVE,
    name: parseName(lexer$$1),
    arguments: parseArguments(lexer$$1, isConst),
    loc: loc(lexer$$1, start)
  };
}

// Implements the parsing rules in the Types section.

/**
 * Type :
 *   - NamedType
 *   - ListType
 *   - NonNullType
 */
function parseTypeReference(lexer$$1) {
  var start = lexer$$1.token;
  var type = void 0;
  if (skip(lexer$$1, lexer.TokenKind.BRACKET_L)) {
    type = parseTypeReference(lexer$$1);
    expect(lexer$$1, lexer.TokenKind.BRACKET_R);
    type = {
      kind: kinds.Kind.LIST_TYPE,
      type: type,
      loc: loc(lexer$$1, start)
    };
  } else {
    type = parseNamedType(lexer$$1);
  }
  if (skip(lexer$$1, lexer.TokenKind.BANG)) {
    return {
      kind: kinds.Kind.NON_NULL_TYPE,
      type: type,
      loc: loc(lexer$$1, start)
    };
  }
  return type;
}

/**
 * NamedType : Name
 */
function parseNamedType(lexer$$1) {
  var start = lexer$$1.token;
  return {
    kind: kinds.Kind.NAMED_TYPE,
    name: parseName(lexer$$1),
    loc: loc(lexer$$1, start)
  };
}

// Implements the parsing rules in the Type Definition section.

/**
 * TypeSystemDefinition :
 *   - SchemaDefinition
 *   - TypeDefinition
 *   - TypeExtension
 *   - DirectiveDefinition
 *
 * TypeDefinition :
 *   - ScalarTypeDefinition
 *   - ObjectTypeDefinition
 *   - InterfaceTypeDefinition
 *   - UnionTypeDefinition
 *   - EnumTypeDefinition
 *   - InputObjectTypeDefinition
 */
function parseTypeSystemDefinition(lexer$$1) {
  // Many definitions begin with a description and require a lookahead.
  var keywordToken = peekDescription(lexer$$1) ? lexer$$1.lookahead() : lexer$$1.token;

  if (keywordToken.kind === lexer.TokenKind.NAME) {
    switch (keywordToken.value) {
      case 'schema':
        return parseSchemaDefinition(lexer$$1);
      case 'scalar':
        return parseScalarTypeDefinition(lexer$$1);
      case 'type':
        return parseObjectTypeDefinition(lexer$$1);
      case 'interface':
        return parseInterfaceTypeDefinition(lexer$$1);
      case 'union':
        return parseUnionTypeDefinition(lexer$$1);
      case 'enum':
        return parseEnumTypeDefinition(lexer$$1);
      case 'input':
        return parseInputObjectTypeDefinition(lexer$$1);
      case 'extend':
        return parseTypeExtension(lexer$$1);
      case 'directive':
        return parseDirectiveDefinition(lexer$$1);
    }
  }

  throw unexpected(lexer$$1, keywordToken);
}

function peekDescription(lexer$$1) {
  return peek(lexer$$1, lexer.TokenKind.STRING) || peek(lexer$$1, lexer.TokenKind.BLOCK_STRING);
}

/**
 * Description : StringValue
 */
function parseDescription(lexer$$1) {
  if (peekDescription(lexer$$1)) {
    return parseStringLiteral(lexer$$1);
  }
}

/**
 * SchemaDefinition : schema Directives[Const]? { OperationTypeDefinition+ }
 */
function parseSchemaDefinition(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'schema');
  var directives = parseDirectives(lexer$$1, true);
  var operationTypes = many(lexer$$1, lexer.TokenKind.BRACE_L, parseOperationTypeDefinition, lexer.TokenKind.BRACE_R);
  return {
    kind: kinds.Kind.SCHEMA_DEFINITION,
    directives: directives,
    operationTypes: operationTypes,
    loc: loc(lexer$$1, start)
  };
}

/**
 * OperationTypeDefinition : OperationType : NamedType
 */
function parseOperationTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var operation = parseOperationType(lexer$$1);
  expect(lexer$$1, lexer.TokenKind.COLON);
  var type = parseNamedType(lexer$$1);
  return {
    kind: kinds.Kind.OPERATION_TYPE_DEFINITION,
    operation: operation,
    type: type,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
 */
function parseScalarTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'scalar');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  return {
    kind: kinds.Kind.SCALAR_TYPE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ObjectTypeDefinition :
 *   Description?
 *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
 */
function parseObjectTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'type');
  var name = parseName(lexer$$1);
  var interfaces = parseImplementsInterfaces(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseFieldsDefinition(lexer$$1);
  return {
    kind: kinds.Kind.OBJECT_TYPE_DEFINITION,
    description: description,
    name: name,
    interfaces: interfaces,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ImplementsInterfaces :
 *   - implements `&`? NamedType
 *   - ImplementsInterfaces & NamedType
 */
function parseImplementsInterfaces(lexer$$1) {
  var types = [];
  if (lexer$$1.token.value === 'implements') {
    lexer$$1.advance();
    // Optional leading ampersand
    skip(lexer$$1, lexer.TokenKind.AMP);
    do {
      types.push(parseNamedType(lexer$$1));
    } while (skip(lexer$$1, lexer.TokenKind.AMP) ||
    // Legacy support for the SDL?
    lexer$$1.options.allowLegacySDLImplementsInterfaces && peek(lexer$$1, lexer.TokenKind.NAME));
  }
  return types;
}

/**
 * FieldsDefinition : { FieldDefinition+ }
 */
function parseFieldsDefinition(lexer$$1) {
  // Legacy support for the SDL?
  if (lexer$$1.options.allowLegacySDLEmptyFields && peek(lexer$$1, lexer.TokenKind.BRACE_L) && lexer$$1.lookahead().kind === lexer.TokenKind.BRACE_R) {
    lexer$$1.advance();
    lexer$$1.advance();
    return [];
  }
  return peek(lexer$$1, lexer.TokenKind.BRACE_L) ? many(lexer$$1, lexer.TokenKind.BRACE_L, parseFieldDefinition, lexer.TokenKind.BRACE_R) : [];
}

/**
 * FieldDefinition :
 *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
 */
function parseFieldDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  var name = parseName(lexer$$1);
  var args = parseArgumentDefs(lexer$$1);
  expect(lexer$$1, lexer.TokenKind.COLON);
  var type = parseTypeReference(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  return {
    kind: kinds.Kind.FIELD_DEFINITION,
    description: description,
    name: name,
    arguments: args,
    type: type,
    directives: directives,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ArgumentsDefinition : ( InputValueDefinition+ )
 */
function parseArgumentDefs(lexer$$1) {
  if (!peek(lexer$$1, lexer.TokenKind.PAREN_L)) {
    return [];
  }
  return many(lexer$$1, lexer.TokenKind.PAREN_L, parseInputValueDef, lexer.TokenKind.PAREN_R);
}

/**
 * InputValueDefinition :
 *   - Description? Name : Type DefaultValue? Directives[Const]?
 */
function parseInputValueDef(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  var name = parseName(lexer$$1);
  expect(lexer$$1, lexer.TokenKind.COLON);
  var type = parseTypeReference(lexer$$1);
  var defaultValue = void 0;
  if (skip(lexer$$1, lexer.TokenKind.EQUALS)) {
    defaultValue = parseConstValue(lexer$$1);
  }
  var directives = parseDirectives(lexer$$1, true);
  return {
    kind: kinds.Kind.INPUT_VALUE_DEFINITION,
    description: description,
    name: name,
    type: type,
    defaultValue: defaultValue,
    directives: directives,
    loc: loc(lexer$$1, start)
  };
}

/**
 * InterfaceTypeDefinition :
 *   - Description? interface Name Directives[Const]? FieldsDefinition?
 */
function parseInterfaceTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'interface');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseFieldsDefinition(lexer$$1);
  return {
    kind: kinds.Kind.INTERFACE_TYPE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * UnionTypeDefinition :
 *   - Description? union Name Directives[Const]? UnionMemberTypes?
 */
function parseUnionTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'union');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var types = parseUnionMemberTypes(lexer$$1);
  return {
    kind: kinds.Kind.UNION_TYPE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    types: types,
    loc: loc(lexer$$1, start)
  };
}

/**
 * UnionMemberTypes :
 *   - = `|`? NamedType
 *   - UnionMemberTypes | NamedType
 */
function parseUnionMemberTypes(lexer$$1) {
  var types = [];
  if (skip(lexer$$1, lexer.TokenKind.EQUALS)) {
    // Optional leading pipe
    skip(lexer$$1, lexer.TokenKind.PIPE);
    do {
      types.push(parseNamedType(lexer$$1));
    } while (skip(lexer$$1, lexer.TokenKind.PIPE));
  }
  return types;
}

/**
 * EnumTypeDefinition :
 *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
 */
function parseEnumTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'enum');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var values = parseEnumValuesDefinition(lexer$$1);
  return {
    kind: kinds.Kind.ENUM_TYPE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    values: values,
    loc: loc(lexer$$1, start)
  };
}

/**
 * EnumValuesDefinition : { EnumValueDefinition+ }
 */
function parseEnumValuesDefinition(lexer$$1) {
  return peek(lexer$$1, lexer.TokenKind.BRACE_L) ? many(lexer$$1, lexer.TokenKind.BRACE_L, parseEnumValueDefinition, lexer.TokenKind.BRACE_R) : [];
}

/**
 * EnumValueDefinition : Description? EnumValue Directives[Const]?
 *
 * EnumValue : Name
 */
function parseEnumValueDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  return {
    kind: kinds.Kind.ENUM_VALUE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    loc: loc(lexer$$1, start)
  };
}

/**
 * InputObjectTypeDefinition :
 *   - Description? input Name Directives[Const]? InputFieldsDefinition?
 */
function parseInputObjectTypeDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'input');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseInputFieldsDefinition(lexer$$1);
  return {
    kind: kinds.Kind.INPUT_OBJECT_TYPE_DEFINITION,
    description: description,
    name: name,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * InputFieldsDefinition : { InputValueDefinition+ }
 */
function parseInputFieldsDefinition(lexer$$1) {
  return peek(lexer$$1, lexer.TokenKind.BRACE_L) ? many(lexer$$1, lexer.TokenKind.BRACE_L, parseInputValueDef, lexer.TokenKind.BRACE_R) : [];
}

/**
 * TypeExtension :
 *   - ScalarTypeExtension
 *   - ObjectTypeExtension
 *   - InterfaceTypeExtension
 *   - UnionTypeExtension
 *   - EnumTypeExtension
 *   - InputObjectTypeDefinition
 */
function parseTypeExtension(lexer$$1) {
  var keywordToken = lexer$$1.lookahead();

  if (keywordToken.kind === lexer.TokenKind.NAME) {
    switch (keywordToken.value) {
      case 'scalar':
        return parseScalarTypeExtension(lexer$$1);
      case 'type':
        return parseObjectTypeExtension(lexer$$1);
      case 'interface':
        return parseInterfaceTypeExtension(lexer$$1);
      case 'union':
        return parseUnionTypeExtension(lexer$$1);
      case 'enum':
        return parseEnumTypeExtension(lexer$$1);
      case 'input':
        return parseInputObjectTypeExtension(lexer$$1);
    }
  }

  throw unexpected(lexer$$1, keywordToken);
}

/**
 * ScalarTypeExtension :
 *   - extend scalar Name Directives[Const]
 */
function parseScalarTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'scalar');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  if (directives.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.SCALAR_TYPE_EXTENSION,
    name: name,
    directives: directives,
    loc: loc(lexer$$1, start)
  };
}

/**
 * ObjectTypeExtension :
 *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
 *  - extend type Name ImplementsInterfaces? Directives[Const]
 *  - extend type Name ImplementsInterfaces
 */
function parseObjectTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'type');
  var name = parseName(lexer$$1);
  var interfaces = parseImplementsInterfaces(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseFieldsDefinition(lexer$$1);
  if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.OBJECT_TYPE_EXTENSION,
    name: name,
    interfaces: interfaces,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * InterfaceTypeExtension :
 *   - extend interface Name Directives[Const]? FieldsDefinition
 *   - extend interface Name Directives[Const]
 */
function parseInterfaceTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'interface');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseFieldsDefinition(lexer$$1);
  if (directives.length === 0 && fields.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.INTERFACE_TYPE_EXTENSION,
    name: name,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * UnionTypeExtension :
 *   - extend union Name Directives[Const]? UnionMemberTypes
 *   - extend union Name Directives[Const]
 */
function parseUnionTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'union');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var types = parseUnionMemberTypes(lexer$$1);
  if (directives.length === 0 && types.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.UNION_TYPE_EXTENSION,
    name: name,
    directives: directives,
    types: types,
    loc: loc(lexer$$1, start)
  };
}

/**
 * EnumTypeExtension :
 *   - extend enum Name Directives[Const]? EnumValuesDefinition
 *   - extend enum Name Directives[Const]
 */
function parseEnumTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'enum');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var values = parseEnumValuesDefinition(lexer$$1);
  if (directives.length === 0 && values.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.ENUM_TYPE_EXTENSION,
    name: name,
    directives: directives,
    values: values,
    loc: loc(lexer$$1, start)
  };
}

/**
 * InputObjectTypeExtension :
 *   - extend input Name Directives[Const]? InputFieldsDefinition
 *   - extend input Name Directives[Const]
 */
function parseInputObjectTypeExtension(lexer$$1) {
  var start = lexer$$1.token;
  expectKeyword(lexer$$1, 'extend');
  expectKeyword(lexer$$1, 'input');
  var name = parseName(lexer$$1);
  var directives = parseDirectives(lexer$$1, true);
  var fields = parseInputFieldsDefinition(lexer$$1);
  if (directives.length === 0 && fields.length === 0) {
    throw unexpected(lexer$$1);
  }
  return {
    kind: kinds.Kind.INPUT_OBJECT_TYPE_EXTENSION,
    name: name,
    directives: directives,
    fields: fields,
    loc: loc(lexer$$1, start)
  };
}

/**
 * DirectiveDefinition :
 *   - Description? directive @ Name ArgumentsDefinition? on DirectiveLocations
 */
function parseDirectiveDefinition(lexer$$1) {
  var start = lexer$$1.token;
  var description = parseDescription(lexer$$1);
  expectKeyword(lexer$$1, 'directive');
  expect(lexer$$1, lexer.TokenKind.AT);
  var name = parseName(lexer$$1);
  var args = parseArgumentDefs(lexer$$1);
  expectKeyword(lexer$$1, 'on');
  var locations = parseDirectiveLocations(lexer$$1);
  return {
    kind: kinds.Kind.DIRECTIVE_DEFINITION,
    description: description,
    name: name,
    arguments: args,
    locations: locations,
    loc: loc(lexer$$1, start)
  };
}

/**
 * DirectiveLocations :
 *   - `|`? DirectiveLocation
 *   - DirectiveLocations | DirectiveLocation
 */
function parseDirectiveLocations(lexer$$1) {
  // Optional leading pipe
  skip(lexer$$1, lexer.TokenKind.PIPE);
  var locations = [];
  do {
    locations.push(parseDirectiveLocation(lexer$$1));
  } while (skip(lexer$$1, lexer.TokenKind.PIPE));
  return locations;
}

/*
 * DirectiveLocation :
 *   - ExecutableDirectiveLocation
 *   - TypeSystemDirectiveLocation
 *
 * ExecutableDirectiveLocation : one of
 *   `QUERY`
 *   `MUTATION`
 *   `SUBSCRIPTION`
 *   `FIELD`
 *   `FRAGMENT_DEFINITION`
 *   `FRAGMENT_SPREAD`
 *   `INLINE_FRAGMENT`
 *
 * TypeSystemDirectiveLocation : one of
 *   `SCHEMA`
 *   `SCALAR`
 *   `OBJECT`
 *   `FIELD_DEFINITION`
 *   `ARGUMENT_DEFINITION`
 *   `INTERFACE`
 *   `UNION`
 *   `ENUM`
 *   `ENUM_VALUE`
 *   `INPUT_OBJECT`
 *   `INPUT_FIELD_DEFINITION`
 */
function parseDirectiveLocation(lexer$$1) {
  var start = lexer$$1.token;
  var name = parseName(lexer$$1);
  if (directiveLocation.DirectiveLocation.hasOwnProperty(name.value)) {
    return name;
  }
  throw unexpected(lexer$$1, start);
}

// Core parsing utility functions

/**
 * Returns a location object, used to identify the place in
 * the source that created a given parsed object.
 */
function loc(lexer$$1, startToken) {
  if (!lexer$$1.options.noLocation) {
    return new Loc(startToken, lexer$$1.lastToken, lexer$$1.source);
  }
}

function Loc(startToken, endToken, source$$1) {
  this.start = startToken.start;
  this.end = endToken.end;
  this.startToken = startToken;
  this.endToken = endToken;
  this.source = source$$1;
}

// Print a simplified form when appearing in JSON/util.inspect.
Loc.prototype.toJSON = Loc.prototype.inspect = function toJSON() {
  return { start: this.start, end: this.end };
};

/**
 * Determines if the next token is of a given kind
 */
function peek(lexer$$1, kind) {
  return lexer$$1.token.kind === kind;
}

/**
 * If the next token is of the given kind, return true after advancing
 * the lexer. Otherwise, do not change the parser state and return false.
 */
function skip(lexer$$1, kind) {
  var match = lexer$$1.token.kind === kind;
  if (match) {
    lexer$$1.advance();
  }
  return match;
}

/**
 * If the next token is of the given kind, return that token after advancing
 * the lexer. Otherwise, do not change the parser state and throw an error.
 */
function expect(lexer$$1, kind) {
  var token = lexer$$1.token;
  if (token.kind === kind) {
    lexer$$1.advance();
    return token;
  }
  throw (0, error.syntaxError)(lexer$$1.source, token.start, 'Expected ' + kind + ', found ' + (0, lexer.getTokenDesc)(token));
}

/**
 * If the next token is a keyword with the given value, return that token after
 * advancing the lexer. Otherwise, do not change the parser state and return
 * false.
 */
function expectKeyword(lexer$$1, value) {
  var token = lexer$$1.token;
  if (token.kind === lexer.TokenKind.NAME && token.value === value) {
    lexer$$1.advance();
    return token;
  }
  throw (0, error.syntaxError)(lexer$$1.source, token.start, 'Expected "' + value + '", found ' + (0, lexer.getTokenDesc)(token));
}

/**
 * Helper function for creating an error when an unexpected lexed token
 * is encountered.
 */
function unexpected(lexer$$1, atToken) {
  var token = atToken || lexer$$1.token;
  return (0, error.syntaxError)(lexer$$1.source, token.start, 'Unexpected ' + (0, lexer.getTokenDesc)(token));
}

/**
 * Returns a possibly empty list of parse nodes, determined by
 * the parseFn. This list begins with a lex token of openKind
 * and ends with a lex token of closeKind. Advances the parser
 * to the next lex token after the closing token.
 */
function any(lexer$$1, openKind, parseFn, closeKind) {
  expect(lexer$$1, openKind);
  var nodes = [];
  while (!skip(lexer$$1, closeKind)) {
    nodes.push(parseFn(lexer$$1));
  }
  return nodes;
}

/**
 * Returns a non-empty list of parse nodes, determined by
 * the parseFn. This list begins with a lex token of openKind
 * and ends with a lex token of closeKind. Advances the parser
 * to the next lex token after the closing token.
 */
function many(lexer$$1, openKind, parseFn, closeKind) {
  expect(lexer$$1, openKind);
  var nodes = [parseFn(lexer$$1)];
  while (!skip(lexer$$1, closeKind)) {
    nodes.push(parseFn(lexer$$1));
  }
  return nodes;
}
});

unwrapExports(parser);

var parse = parser.parse;

// Strip insignificant whitespace
// Note that this could do a lot more, such as reorder fields etc.
function normalize(string) {
  return string.replace(/[\s,]+/g, ' ').trim();
}

// A map docString -> graphql document
var docCache = {};

// A map fragmentName -> [normalized source]
var fragmentSourceMap = {};

function cacheKeyFromLoc(loc) {
  return normalize(loc.source.body.substring(loc.start, loc.end));
}

// For testing.
function resetCaches() {
  docCache = {};
  fragmentSourceMap = {};
}

// Take a unstripped parsed document (query/mutation or even fragment), and
// check all fragment definitions, checking for name->source uniqueness.
// We also want to make sure only unique fragments exist in the document.
var printFragmentWarnings = true;
function processFragments(ast) {
  var astFragmentMap = {};
  var definitions = [];

  for (var i = 0; i < ast.definitions.length; i++) {
    var fragmentDefinition = ast.definitions[i];

    if (fragmentDefinition.kind === 'FragmentDefinition') {
      var fragmentName = fragmentDefinition.name.value;
      var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

      // We know something about this fragment
      if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {

        // this is a problem because the app developer is trying to register another fragment with
        // the same name as one previously registered. So, we tell them about it.
        if (printFragmentWarnings) {
          console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
            + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
            + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
        }

        fragmentSourceMap[fragmentName][sourceKey] = true;

      } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
        fragmentSourceMap[fragmentName] = {};
        fragmentSourceMap[fragmentName][sourceKey] = true;
      }

      if (!astFragmentMap[sourceKey]) {
        astFragmentMap[sourceKey] = true;
        definitions.push(fragmentDefinition);
      }
    } else {
      definitions.push(fragmentDefinition);
    }
  }

  ast.definitions = definitions;
  return ast;
}

function disableFragmentWarnings() {
  printFragmentWarnings = false;
}

function stripLoc(doc, removeLocAtThisLevel) {
  var docType = Object.prototype.toString.call(doc);

  if (docType === '[object Array]') {
    return doc.map(function (d) {
      return stripLoc(d, removeLocAtThisLevel);
    });
  }

  if (docType !== '[object Object]') {
    throw new Error('Unexpected input.');
  }

  // We don't want to remove the root loc field so we can use it
  // for fragment substitution (see below)
  if (removeLocAtThisLevel && doc.loc) {
    delete doc.loc;
  }

  // https://github.com/apollographql/graphql-tag/issues/40
  if (doc.loc) {
    delete doc.loc.startToken;
    delete doc.loc.endToken;
  }

  var keys = Object.keys(doc);
  var key;
  var value;
  var valueType;

  for (key in keys) {
    if (keys.hasOwnProperty(key)) {
      value = doc[keys[key]];
      valueType = Object.prototype.toString.call(value);

      if (valueType === '[object Object]' || valueType === '[object Array]') {
        doc[keys[key]] = stripLoc(value, true);
      }
    }
  }

  return doc;
}

var experimentalFragmentVariables = false;
function parseDocument(doc) {
  var cacheKey = normalize(doc);

  if (docCache[cacheKey]) {
    return docCache[cacheKey];
  }

  var parsed = parse(doc, { experimentalFragmentVariables: experimentalFragmentVariables });
  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  // check that all "new" fragments inside the documents are consistent with
  // existing fragments of the same name
  parsed = processFragments(parsed);
  parsed = stripLoc(parsed, false);
  docCache[cacheKey] = parsed;

  return parsed;
}

function enableExperimentalFragmentVariables() {
  experimentalFragmentVariables = true;
}

function disableExperimentalFragmentVariables() {
  experimentalFragmentVariables = false;
}

// XXX This should eventually disallow arbitrary string interpolation, like Relay does
function gql(/* arguments */) {
  var args = Array.prototype.slice.call(arguments);

  var literals = args[0];

  // We always get literals[0] and then matching post literals for each arg given
  var result = (typeof(literals) === "string") ? literals : literals[0];

  for (var i = 1; i < args.length; i++) {
    if (args[i] && args[i].kind && args[i].kind === 'Document') {
      result += args[i].loc.source.body;
    } else {
      result += args[i];
    }

    result += literals[i];
  }

  return parseDocument(result);
}

// Support typescript, which isn't as nice as Babel about default exports
gql.default = gql;
gql.resetCaches = resetCaches;
gql.disableFragmentWarnings = disableFragmentWarnings;
gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

var src = gql;

var require$$0$2 = ( apolloClient && ApolloClient$2 ) || apolloClient;

var lib = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (commonjsGlobal && commonjsGlobal.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require$$0$2);
__export(lib$2);
__export(lib$3);
var apollo_link_1 = lib$2;

exports.HttpLink = lib$4.HttpLink;


var apollo_cache_inmemory_1 = lib$3;
exports.InMemoryCache = apollo_cache_inmemory_1.InMemoryCache;

exports.gql = src.default;
var apollo_client_1 = require$$0$2;
var DefaultClient = (function (_super) {
    __extends(DefaultClient, _super);
    function DefaultClient(config) {
        var _this = this;
        var cache = config && config.cacheRedirects
            ? new apollo_cache_inmemory_1.InMemoryCache({ cacheRedirects: config.cacheRedirects })
            : new apollo_cache_inmemory_1.InMemoryCache();
        var stateLink = config && config.clientState
            ? lib$5.withClientState(__assign({}, config.clientState, { cache: cache }))
            : false;
        var errorLink = config && config.onError
            ? lib$6.onError(config.onError)
            : lib$6.onError(function (_a) {
                var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError;
                if (graphQLErrors)
                    graphQLErrors.map(function (_a) {
                        var message = _a.message, locations = _a.locations, path = _a.path;
                        return console.log("[GraphQL error]: Message: " + message + ", Location: " + locations + ", Path: " + path);
                    });
                if (networkError)
                    console.log("[Network error]: " + networkError);
            });
        var requestHandler = config && config.request
            ? new apollo_link_1.ApolloLink(function (operation, forward) {
                return new apollo_link_1.Observable(function (observer) {
                    var handle;
                    Promise.resolve(operation)
                        .then(function (oper) { return config.request(oper); })
                        .then(function () {
                        handle = forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer),
                        });
                    })
                        .catch(observer.error.bind(observer));
                    return function () {
                        if (handle)
                            handle.unsubscribe;
                    };
                });
            })
            : false;
        var httpLink = new lib$4.HttpLink({
            uri: (config && config.uri) || '/graphql',
            fetchOptions: (config && config.fetchOptions) || {},
            credentials: 'same-origin',
        });
        var link = apollo_link_1.ApolloLink.from([
            errorLink,
            requestHandler,
            stateLink,
            httpLink,
        ].filter(function (x) { return !!x; }));
        _this = _super.call(this, { cache: cache, link: link }) || this;
        return _this;
    }
    return DefaultClient;
}(apollo_client_1.default));
exports.default = DefaultClient;

});

var ApolloClient = unwrapExports(lib);

const client = new ApolloClient();

const PLAY_CLASS = "button-nfplayerPlay";
const PAUSE_CLASS = "button-nfplayerPause";

class Player {
    constructor() {
        document.addEventListener("click", event => {
            console.log(event);
            if (event.target.classList.contains(PLAY_CLASS)) {
                this.onPlay();
            }
            if (event.target.classList.contains(PAUSE_CLASS)) {
                this.onPause();
            }
        });
    }

    onPlay() {
        console.log("onPlay");
    }

    onPause() {
        console.log("onPause");
    }
}

new Player();
