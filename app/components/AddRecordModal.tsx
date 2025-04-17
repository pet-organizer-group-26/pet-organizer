import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import CustomDatePicker from './CustomDatePicker';

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

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  recordType,
  onClose,
  onSave,
  initialData,
}) => {
  // Common fields
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Vaccination fields
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  
  // Medication fields
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [refills, setRefills] = useState('');
  
  // Vet visit fields
  const [visitDate, setVisitDate] = useState('');
  const [reason, setReason] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Allergy fields
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [reaction, setReaction] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  
  useEffect(() => {
    if (initialData) {
      // Handle common fields
      if ('id' in initialData) setId(initialData.id);
      if ('name' in initialData) setName(initialData.name);
      if ('notes' in initialData) setNotes(initialData.notes || '');
      
      // Handle specific record type fields
      if (recordType === 'vaccination') {
        const data = initialData as VaccinationRecord;
        setVaccinationDate(data.date || '');
        setExpirationDate(data.expiration_date || '');
        setAdministeredBy(data.administered_by || '');
        setLotNumber(data.lot_number || '');
      } else if (recordType === 'medication') {
        const data = initialData as MedicationRecord;
        setDosage(data.dosage || '');
        setFrequency(data.frequency || '');
        setStartDate(data.start_date || '');
        setEndDate(data.end_date || '');
        setTimeOfDay(data.time_of_day || '');
        setPrescribedBy(data.prescribed_by || '');
        setPharmacy(data.pharmacy || '');
        setRefills(data.refills?.toString() || '');
      } else if (recordType === 'vet_visit') {
        const data = initialData as VetVisitRecord;
        setVisitDate(data.date || '');
        setReason(data.reason || '');
        setVetName(data.vet_name || '');
        setClinicName(data.clinic_name || '');
        setDiagnosis(data.diagnosis || '');
        setTreatment(data.treatment || '');
        setCost(data.cost?.toString() || '');
        setFollowUpDate(data.follow_up_date || '');
      } else if (recordType === 'allergy') {
        const data = initialData as AllergyRecord;
        setSeverity(data.severity || 'Mild');
        setReaction(data.reaction || '');
        setDiagnosedDate(data.diagnosed_date || '');
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
    setVaccinationDate('');
    setExpirationDate('');
    setAdministeredBy('');
    setLotNumber('');
    
    setDosage('');
    setFrequency('');
    setStartDate('');
    setEndDate('');
    setTimeOfDay('');
    setPrescribedBy('');
    setPharmacy('');
    setRefills('');
    
    setVisitDate('');
    setReason('');
    setVetName('');
    setClinicName('');
    setDiagnosis('');
    setTreatment('');
    setCost('');
    setFollowUpDate('');
    
    setSeverity('Mild');
    setReaction('');
    setDiagnosedDate('');
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
          date: vaccinationDate,
          expiration_date: expirationDate || undefined,
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
          start_date: startDate,
          end_date: endDate || undefined,
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
          date: visitDate,
          reason,
          vet_name: vetName || undefined,
          clinic_name: clinicName || undefined,
          diagnosis: diagnosis || undefined,
          treatment: treatment || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          follow_up_date: followUpDate || undefined,
          notes: notes || undefined,
        };
        break;
      
      case 'allergy':
        data = {
          id,
          name,
          severity,
          reaction: reaction || undefined,
          diagnosed_date: diagnosedDate || undefined,
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
        <Text style={styles.label}>Date *</Text>
        <CustomDatePicker
          value={vaccinationDate ? new Date(vaccinationDate) : new Date()}
          onChange={(date) => setVaccinationDate(date.toISOString().split('T')[0])}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Expiration Date</Text>
        <CustomDatePicker
          value={expirationDate ? new Date(expirationDate) : new Date()}
          onChange={(date) => setExpirationDate(date.toISOString().split('T')[0])}
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
        <Text style={styles.label}>Start Date *</Text>
        <CustomDatePicker
          value={startDate ? new Date(startDate) : new Date()}
          onChange={(date) => setStartDate(date.toISOString().split('T')[0])}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>End Date</Text>
        <CustomDatePicker
          value={endDate ? new Date(endDate) : new Date()}
          onChange={(date) => setEndDate(date.toISOString().split('T')[0])}
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
        <Text style={styles.label}>Date *</Text>
        <CustomDatePicker
          value={visitDate ? new Date(visitDate) : new Date()}
          onChange={(date) => setVisitDate(date.toISOString().split('T')[0])}
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
        <Text style={styles.label}>Follow-up Date</Text>
        <CustomDatePicker
          value={followUpDate ? new Date(followUpDate) : new Date()}
          onChange={(date) => setFollowUpDate(date.toISOString().split('T')[0])}
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
        <Text style={styles.label}>Diagnosed Date</Text>
        <CustomDatePicker
          value={diagnosedDate ? new Date(diagnosedDate) : new Date()}
          onChange={(date) => setDiagnosedDate(date.toISOString().split('T')[0])}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
            {renderForm()}
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
              variant="primary"
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: '70%',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
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

export default AddRecordModal; 