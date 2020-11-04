"use strict";

module.exports = ({ types: t }) => {
  function buildInjectAssignment(object, dependencyNames) {
    const injectProperty = t.memberExpression(object, t.identifier("$inject"));
    const injectArray = t.arrayExpression(
      dependencyNames.map((name) => t.stringLiteral(name))
    );
    const injectPropertyAssignment = t.assignmentExpression(
      "=",
      injectProperty,
      injectArray
    );
    const injectStatement = t.expressionStatement(injectPropertyAssignment);
    return injectStatement;
  }

  function hasInjectArgsAnnotation(path) {
    const leadingComments = path.node.leadingComments || [];
    return leadingComments.some((comment) =>
      comment.value.split("\n").some((line) => line.match(/@inject\b/))
    );
  }

  function getParamNames(functionDeclNode) {
    return functionDeclNode.params.map((param) => param.name);
  }

  function buildInjectAssignmentForFunction(node) {
    const paramNames = getParamNames(node);
    return buildInjectAssignment(node.id, paramNames);
  }

  function buildInjectAssignmentForClass(node) {
    const constructor = node.body.body.find(
      (item) => t.isClassMethod(item) && item.kind === "constructor"
    );
    const paramNames = constructor ? getParamNames(constructor) : [];
    return buildInjectAssignment(node.id, paramNames);
  }

  return {
    visitor: {
      ClassDeclaration(path) {
        if (!hasInjectArgsAnnotation(path)) {
          return;
        }
        const injectAssignment = buildInjectAssignmentForClass(path.node);
        path.insertAfter(injectAssignment);
      },

      "ExportNamedDeclaration|ExportDefaultDeclaration"(path) {
        if (!hasInjectArgsAnnotation(path)) {
          return;
        }

        let injectAssignment;
        if (t.isFunctionDeclaration(path.node.declaration)) {
          injectAssignment = buildInjectAssignmentForFunction(
            path.node.declaration
          );
        } else if (t.isClassDeclaration(path.node.declaration)) {
          injectAssignment = buildInjectAssignmentForClass(
            path.node.declaration
          );
        }

        if (injectAssignment) {
          path.insertAfter(injectAssignment);
        }
      },

      FunctionDeclaration(path) {
        if (!hasInjectArgsAnnotation(path)) {
          return;
        }
        const injectAssignment = buildInjectAssignmentForFunction(path.node);
        path.insertAfter(injectAssignment);
      },
    },
  };
};
