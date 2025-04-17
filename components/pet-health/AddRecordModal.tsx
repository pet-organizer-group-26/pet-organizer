import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '../common/InputField';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import theme from '../../constants/theme';
import { DatePicker } from '../common/DatePicker';
import { TimePicker } from '../common/TimePicker';
import { VaccinationType } from './VaccinationItem';
import { MedicationType } from './MedicationItem';
import { VetVisitType } from './VetVisitItem';

export type RecordType = 'vaccination' | 'medication' | 'vet_visit' | 'allergy';

type VaccinationRecord = {
  id?: string;
  name: string;
  date: string;
  expiration_date?: string;
  administered_by?: string;
  lot_number?: string;
  notes?: string;
};

type MedicationRecord = {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  time_of_day?: string;
  prescribed_by?: string;
  pharmacy?: string;
  refills?: number;
  notes?: string;
};

type VetVisitRecord = {
  id?: string;
  date: string;
  reason: string;
  vet_name?: string;
  clinic_name?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  follow_up_date?: string;
  notes?: string;
};

type AllergyRecord = {
  id?: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction?: string;
  diagnosed_date?: string;
  notes?: string;
};

type RecordData = VaccinationRecord | MedicationRecord | VetVisitRecord | AllergyRecord;

interface AddRecordModalProps {
  visible: boolean;
  recordType: RecordType;
  onClose: () => void;
  onSave: (data: RecordData) => void;
  initialData?: RecordData;
}

// Helper function to convert string date to Date object
const stringToDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

// Helper function to convert Date object to string
const dateToString = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  recordType,
  onClose,
  onSave,
  initialData,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  // Common fields
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Vaccination fields
  const [vaccinationDate, setVaccinationDate] = useState<Date | undefined>(undefined);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [administeredBy, setAdministeredBy] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  
  // Medication fields
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [refills, setRefills] = useState('');
  
  // Vet visit fields
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  
  // Allergy fields
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [reaction, setReaction] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (initialData) {
      // Handle common fields
      if ('id' in initialData) setId(initialData.id);
      if ('name' in initialData) setName(initialData.name);
      if ('notes' in initialData) setNotes(initialData.notes || '');
      
      // Handle specific record type fields
      if (recordType === 'vaccination') {
        const data = initialData as VaccinationRecord;
        setVaccinationDate(stringToDate(data.date));
        setExpirationDate(stringToDate(data.expiration_date));
        setAdministeredBy(data.administered_by || '');
        setLotNumber(data.lot_number || '');
      } else if (recordType === 'medication') {
        const data = initialData as MedicationRecord;
        setDosage(data.dosage || '');
        setFrequency(data.frequency || '');
        setStartDate(stringToDate(data.start_date));
        setEndDate(stringToDate(data.end_date));
        setTimeOfDay(data.time_of_day || '');
        setPrescribedBy(data.prescribed_by || '');
        setPharmacy(data.pharmacy || '');
        setRefills(data.refills?.toString() || '');
      } else if (recordType === 'vet_visit') {
        const data = initialData as VetVisitRecord;
        setVisitDate(stringToDate(data.date));
        setReason(data.reason || '');
        setVetName(data.vet_name || '');
        setClinicName(data.clinic_name || '');
        setDiagnosis(data.diagnosis || '');
        setTreatment(data.treatment || '');
        setCost(data.cost?.toString() || '');
        setFollowUpDate(stringToDate(data.follow_up_date));
      } else if (recordType === 'allergy') {
        const data = initialData as AllergyRecord;
        setSeverity(data.severity || 'Mild');
        setReaction(data.reaction || '');
        setDiagnosedDate(stringToDate(data.diagnosed_date));
      }
    } else {
      resetForm();
    }
  }, [initialData, recordType, visible]);

  const resetForm = () => {
    // Reset common fields
    setId(undefined);
    setName('');
    setNotes('');
    
    // Reset specific fields
    setVaccinationDate(undefined);
    setExpirationDate(undefined);
    setAdministeredBy('');
    setLotNumber('');
    
    setDosage('');
    setFrequency('');
    setStartDate(undefined);
    setEndDate(undefined);
    setTimeOfDay('');
    setPrescribedBy('');
    setPharmacy('');
    setRefills('');
    
    setVisitDate(undefined);
    setReason('');
    setVetName('');
    setClinicName('');
    setDiagnosis('');
    setTreatment('');
    setCost('');
    setFollowUpDate(undefined);
    
    setSeverity('Mild');
    setReaction('');
    setDiagnosedDate(undefined);
  };

  const validateForm = (): boolean => {
    switch (recordType) {
      case 'vaccination':
        if (!name.trim()) {
          Alert.alert('Error', 'Vaccination name is required');
          return false;
        }
        if (!vaccinationDate) {
          Alert.alert('Error', 'Vaccination date is required');
          return false;
        }
        break;
      
      case 'medication':
        if (!name.trim()) {
          Alert.alert('Error', 'Medication name is required');
          return false;
        }
        if (!dosage.trim()) {
          Alert.alert('Error', 'Dosage is required');
          return false;
        }
        if (!frequency.trim()) {
          Alert.alert('Error', 'Frequency is required');
          return false;
        }
        if (!startDate) {
          Alert.alert('Error', 'Start date is required');
          return false;
        }
        break;
      
      case 'vet_visit':
        if (!visitDate) {
          Alert.alert('Error', 'Visit date is required');
          return false;
        }
        if (!reason.trim()) {
          Alert.alert('Error', 'Reason for visit is required');
          return false;
        }
        break;
      
      case 'allergy':
        if (!name.trim()) {
          Alert.alert('Error', 'Allergy name is required');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    let data: RecordData;
    
    switch (recordType) {
      case 'vaccination':
        data = {
          id,
          name,
          date: dateToString(vaccinationDate),
          expiration_date: expirationDate ? dateToString(expirationDate) : undefined,
          administered_by: administeredBy || undefined,
          lot_number: lotNumber || undefined,
          notes: notes || undefined,
        };
        break;
      
      case 'medication':
        data = {
          id,
          name,
          dosage,
          frequency,
          start_date: dateToString(startDate),
          end_date: endDate ? dateToString(endDate) : undefined,
          time_of_day: timeOfDay || undefined,
          prescribed_by: prescribedBy || undefined,
          pharmacy: pharmacy || undefined,
          refills: refills ? parseInt(refills, 10) : undefined,
          notes: notes || undefined,
        };
        break;
      
      case 'vet_visit':
        data = {
          id,
          date: dateToString(visitDate),
          reason,
          vet_name: vetName || undefined,
          clinic_name: clinicName || undefined,
          diagnosis: diagnosis || undefined,
          treatment: treatment || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          follow_up_date: followUpDate ? dateToString(followUpDate) : undefined,
          notes: notes || undefined,
        };
        break;
      
      case 'allergy':
        data = {
          id,
          name,
          severity,
          reaction: reaction || undefined,
          diagnosed_date: diagnosedDate ? dateToString(diagnosedDate) : undefined,
          notes: notes || undefined,
        };
        break;
      
      default:
        return;
    }
    
    onSave(data);
    resetForm();
    onClose();
  };

  const getTitle = () => {
    const action = id ? 'Edit' : 'Add';
    switch (recordType) {
      case 'vaccination':
        return `${action} Vaccination`;
      case 'medication':
        return `${action} Medication`;
      case 'vet_visit':
        return `${action} Vet Visit`;
      case 'allergy':
        return `${action} Allergy`;
      default:
        return `${action} Record`;
    }
  };

  const renderVaccinationForm = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Vaccine name"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <DatePicker 
          value={vaccinationDate || new Date()}
          onChange={(date: Date) => setVaccinationDate(date)}
          label="Date *"
          minDate={undefined}
          maxDate={new Date()}
        />
      </View>

      <View style={styles.inputContainer}>
        <DatePicker
          value={expirationDate || new Date()}
          onChange={(date: Date) => setExpirationDate(date)}
          label="Expiration Date"
          minDate={vaccinationDate || undefined}
          maxDate={undefined}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Administered By</Text>
        <TextInput
          style={styles.input}
          value={administeredBy}
          onChangeText={setAdministeredBy}
          placeholder="Veterinarian or clinic"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Lot Number</Text>
        <TextInput
          style={styles.input}
          value={lotNumber}
          onChangeText={setLotNumber}
          placeholder="Vaccine lot number"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes"
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderMedicationForm = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Medication name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g., 10mg, 1 tablet"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Frequency *</Text>
        <TextInput
          style={styles.input}
          value={frequency}
          onChangeText={setFrequency}
          placeholder="e.g., Once daily, Twice daily"
        />
      </View>

      <View style={styles.inputContainer}>
        <DatePicker 
          value={startDate || new Date()}
          onChange={(date: Date) => setStartDate(date)}
          label="Start Date *"
          minDate={undefined}
          maxDate={new Date()}
        />
      </View>

      <View style={styles.inputContainer}>
        <DatePicker 
          value={endDate || new Date()}
          onChange={(date: Date) => setEndDate(date)}
          label="End Date (Optional)"
          minDate={startDate || undefined}
          maxDate={undefined}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time of Day</Text>
        <TextInput
          style={styles.input}
          value={timeOfDay}
          onChangeText={setTimeOfDay}
          placeholder="e.g., Morning, Evening, With meals"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prescribed By</Text>
        <TextInput
          style={styles.input}
          value={prescribedBy}
          onChangeText={setPrescribedBy}
          placeholder="Veterinarian name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pharmacy</Text>
        <TextInput
          style={styles.input}
          value={pharmacy}
          onChangeText={setPharmacy}
          placeholder="Pharmacy name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Refills</Text>
        <TextInput
          style={styles.input}
          value={refills}
          onChangeText={setRefills}
          placeholder="Number of refills"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes"
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderVetVisitForm = () => (
    <>
      <View style={styles.inputContainer}>
        <DatePicker 
          value={visitDate || new Date()}
          onChange={(date: Date) => setVisitDate(date)}
          label="Visit Date *"
          minDate={undefined}
          maxDate={new Date()}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reason *</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Reason for visit"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Veterinarian</Text>
        <TextInput
          style={styles.input}
          value={vetName}
          onChangeText={setVetName}
          placeholder="Veterinarian name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Clinic</Text>
        <TextInput
          style={styles.input}
          value={clinicName}
          onChangeText={setClinicName}
          placeholder="Clinic name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Diagnosis</Text>
        <TextInput
          style={styles.input}
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Diagnosis"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Treatment</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={treatment}
          onChangeText={setTreatment}
          placeholder="Treatment details"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cost</Text>
        <TextInput
          style={styles.input}
          value={cost}
          onChangeText={setCost}
          placeholder="Cost of visit"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <DatePicker
          value={followUpDate || new Date()}
          onChange={(date: Date) => setFollowUpDate(date)}
          label="Follow-up Date"
          minDate={visitDate || undefined}
          maxDate={undefined}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes"
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderAllergyForm = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Allergy *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Allergy name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Severity</Text>
        <View style={styles.severityContainer}>
          {['Mild', 'Moderate', 'Severe'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.severityOption,
                severity === option && styles.severitySelected,
                { 
                  backgroundColor: option === 'Mild' 
                    ? severity === 'Mild' ? '#4caf5080' : '#f5f5f5'
                    : option === 'Moderate'
                    ? severity === 'Moderate' ? '#ff980080' : '#f5f5f5'
                    : severity === 'Severe' ? '#f4433680' : '#f5f5f5'
                }
              ]}
              onPress={() => setSeverity(option as 'Mild' | 'Moderate' | 'Severe')}
            >
              <Text style={styles.severityText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reaction</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={reaction}
          onChangeText={setReaction}
          placeholder="Describe the reaction"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <DatePicker 
          value={diagnosedDate || new Date()}
          onChange={(date: Date) => setDiagnosedDate(date)}
          label="Diagnosed Date"
          minDate={undefined}
          maxDate={new Date()}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes"
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderForm = () => {
    switch (recordType) {
      case 'vaccination':
        return renderVaccinationForm();
      case 'medication':
        return renderMedicationForm();
      case 'vet_visit':
        return renderVetVisitForm();
      case 'allergy':
        return renderAllergyForm();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContainer}>
          <Card variant="floating" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getTitle()}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollView}>
              <View style={styles.formContainer}>
                {renderForm()}
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Cancel" 
                onPress={onClose} 
                variant="outline"
                style={styles.button}
              />
              <Button 
                title="Save" 
                onPress={handleSave} 
                style={styles.button}
              />
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = () => {
  const { colors } = useTheme();
  
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    keyboardAvoidingView: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: '5%',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.background.default,
      borderRadius: theme.borderRadius.md,
      padding: 0,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    scrollView: {
      maxHeight: '80%',
    },
    formContainer: {
      padding: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: 6,
      fontWeight: '600',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    dateInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      height: 48,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    dateText: {
      fontSize: 16,
      color: '#333',
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    buttonContainer: {
      flexDirection: 'column',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    button: {
      marginBottom: 8,
      height: 50,
    },
    severityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    severityOption: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    severitySelected: {
      borderWidth: 2,
      borderColor: '#000',
    },
    severityText: {
      fontWeight: '500',
      color: '#333',
    },
  });
}; 