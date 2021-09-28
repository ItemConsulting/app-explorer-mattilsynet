import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	nonNull,
	list,
	reference
} from '/lib/graphql';

import {GQL_TYPE_DOCUMENT_TYPE_NAME} from '../constants';
import {GQL_TYPE_REFERENCED_BY_NAME} from '../generateReferencedByField';
import {referencedByMapped} from '../referencedByMapped';


export function generateDocumentTypeTypes({
	glue
}) {
	const {
		objectTypes,
		scalarTypes
	} = glue;
	const ENUM_VALUE_TYPES = glue.addEnumType({
		name: 'EnumValueTypes',
		values: [
			VALUE_TYPE_BOOLEAN,
			VALUE_TYPE_DOUBLE,
			VALUE_TYPE_GEO_POINT,
			VALUE_TYPE_INSTANT,
			VALUE_TYPE_LOCAL_DATE,
			VALUE_TYPE_LOCAL_DATE_TIME,
			VALUE_TYPE_LOCAL_TIME,
			VALUE_TYPE_LONG,
			VALUE_TYPE_SET,
			VALUE_TYPE_STRING
		]
	});
	const FIELDS_PROPERTY = {
		active: { type: nonNull(GraphQLBoolean) },
		enabled: { type: nonNull(GraphQLBoolean) },
		fulltext: { type: nonNull(GraphQLBoolean) },
		includeInAllText: { type: nonNull(GraphQLBoolean) },
		max: { type: nonNull(GraphQLInt) },
		min: { type: nonNull(GraphQLInt) },
		ngram: { type: nonNull(GraphQLBoolean) },
		name: { type: scalarTypes._name },
		valueType: { type: nonNull(ENUM_VALUE_TYPES) }
	};
	const GQL_TYPE_DOCUMENT_TYPE_FIELDS = glue.addObjectType({
		name: 'DocumentTypeFields',
		fields: {
			active: { type: nonNull(GraphQLBoolean) },
			fieldId: { type: scalarTypes._id }
		}
	});
	const GQL_TYPE_DOCUMENT_TYPE_PROPERTIES = glue.addObjectType({
		name: 'DocumentTypeProperties',
		fields: FIELDS_PROPERTY
	});

	glue.addObjectType({
		name: GQL_TYPE_DOCUMENT_TYPE_NAME,
		fields: {
			_id: { type: scalarTypes._id },
			_name: { type: scalarTypes._name },
			_nodeType: { type: scalarTypes._nodeType },
			_path: { type: scalarTypes._path },
			_versionKey: { type: scalarTypes._versionKey }, // Used with atomicUpdate
			addFields: { type: nonNull(GraphQLBoolean) },
			fields: { type: list(GQL_TYPE_DOCUMENT_TYPE_FIELDS)},
			properties: { type: list(GQL_TYPE_DOCUMENT_TYPE_PROPERTIES)},
			referencedBy: {
				resolve: ({source: {_id}}) => referencedByMapped({_id}),
				type: reference(GQL_TYPE_REFERENCED_BY_NAME)
			}
		}
	});

	return {
		GQL_INPUT_TYPE_ADD_FIELDS: GraphQLBoolean,
		GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS: glue.addInputType({
			name: 'InputDocumentTypeFields',
			fields: {
				active: { type: nonNull(GraphQLBoolean) },
				fieldId: { type: scalarTypes._id }
			}
		}),
		GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES: glue.addInputType({
			name: 'InputDocumentTypeProperties',
			fields: FIELDS_PROPERTY
		}),
		GQL_TYPE_DOCUMENT_TYPE: objectTypes[GQL_TYPE_DOCUMENT_TYPE_NAME]
	};
} // generateDocumentTypeTypes
